import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'cups'];

export default function StockManagementScreen() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState('');
  const [minStock, setMinStock] = useState('10');
  const [supplier, setSupplier] = useState('');
  const [usagePerOrder, setUsagePerOrder] = useState('0.5');
  const [price, setPrice] = useState('');

  useEffect(() => { fetchIngredients(); }, []);

  const fetchIngredients = async () => {
    try {
      const res = await api.get('/inventory');
      setIngredients(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setName(''); setUnit('kg'); setCurrentStock('');
    setMinStock('10'); setSupplier('');
    setUsagePerOrder('0.5'); setPrice('');
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name);
    setUnit(item.unit);
    setCurrentStock(String(item.currentStock));
    setMinStock(String(item.minStock));
    setSupplier(item.supplier || '');
    setUsagePerOrder(String(item.usagePerOrder || 0.5));
    setPrice(String(item.price || 0));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !name.trim() || !unit || !currentStock || !minStock) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (isNaN(Number(currentStock)) || Number(currentStock) < 0) {
      Alert.alert('Error', 'Current stock must be a valid non-negative number');
      return;
    }
    if (isNaN(Number(minStock)) || Number(minStock) < 0) {
      Alert.alert('Error', 'Minimum stock must be a valid non-negative number');
      return;
    }
    if (usagePerOrder && (isNaN(Number(usagePerOrder)) || Number(usagePerOrder) < 0)) {
      Alert.alert('Error', 'Usage per order must be a valid non-negative number');
      return;
    }
    if (price && (isNaN(Number(price)) || Number(price) < 0)) {
      Alert.alert('Error', 'Price must be a valid non-negative number');
      return;
    }
    setSaving(true);
    try {
      const data = {
        name, unit,
        currentStock: Number(currentStock),
        minStock: Number(minStock),
        supplier,
        usagePerOrder: Number(usagePerOrder) || 0.5,
        price: Number(price) || 0,
      };
      if (editing) {
        await api.put(`/inventory/${editing._id}`, data);
      } else {
        await api.post('/inventory', data);
      }
      setModalVisible(false);
      fetchIngredients();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/inventory/${item._id}`);
          fetchIngredients();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete');
        }
      }}
    ]);
  };

  const handleRestock = (item) => {
    Alert.prompt(
      'Restock',
      `Add stock for ${item.name} (current: ${item.currentStock} ${item.unit})`,
      async (qty) => {
        if (!qty || isNaN(qty)) return;
        try {
          const res = await api.put(`/inventory/${item._id}/restock`, {
            quantity: Number(qty)
          });
          Alert.alert('Success', res.data.message);
          fetchIngredients();
        } catch (err) {
          Alert.alert('Error', 'Failed to restock');
        }
      },
      'plain-text',
      '',
      'numeric'
    );
  };

  const getStatusColor = (item) => {
    if (item.currentStock === 0) return '#c62828';
    if (item.isLowStock) return '#e65100';
    return '#2e7d32';
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card,
      item.currentStock === 0 ? styles.cardOut :
      item.isLowStock ? styles.cardLow : null
    ]}>
      <View style={styles.cardTop}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={[styles.statusBadge, { color: getStatusColor(item) }]}>
          {item.stockStatus === 'OUT_OF_STOCK' ? '🔴 OUT' :
           item.stockStatus === 'LOW' ? '🟡 LOW' : '🟢 OK'}
        </Text>
      </View>

      <View style={styles.stockRow}>
        <Text style={styles.stockText}>
          Stock: <Text style={{ fontWeight: 'bold', color: getStatusColor(item) }}>
            {item.currentStock} {item.unit}
          </Text>
        </Text>
        <Text style={styles.minText}>Min: {item.minStock} {item.unit}</Text>
      </View>

      <Text style={styles.usageText}>
        Usage per order: {item.usagePerOrder} {item.unit}
      </Text>

      {item.supplier && (
        <Text style={styles.supplierText}>Supplier: {item.supplier}</Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>✏️ Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.restockBtn} onPress={() => handleRestock(item)}>
          <Text style={styles.restockBtnText}>+ Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.header}>Stock Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={ingredients}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={fetchIngredients}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.empty}>No ingredients added yet</Text>
        }
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editing ? 'Edit Ingredient' : 'Add Ingredient'}
            </Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TextInput style={styles.input}
                placeholder="Ingredient Name *"
                value={name} onChangeText={setName}
                editable={!editing}
              />

              <Text style={styles.inputLabel}>Unit *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 12 }}>
                {UNITS.map(u => (
                  <TouchableOpacity key={u}
                    style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TextInput style={styles.input}
                placeholder="Current Stock *"
                value={currentStock} onChangeText={setCurrentStock}
                keyboardType="numeric" />
              <TextInput style={styles.input}
                placeholder="Minimum Stock Level * (default: 10)"
                value={minStock} onChangeText={setMinStock}
                keyboardType="numeric" />
              <TextInput style={styles.input}
                placeholder="Usage per order (default: 0.5)"
                value={usagePerOrder} onChangeText={setUsagePerOrder}
                keyboardType="numeric" />
              <TextInput style={styles.input}
                placeholder="Price per unit"
                value={price} onChangeText={setPrice}
                keyboardType="numeric" />
              <TextInput style={styles.input}
                placeholder="Supplier name"
                value={supplier} onChangeText={setSupplier} />

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn}
                  onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>
                        {editing ? 'Update' : 'Add'}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:          { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', padding: 16 },
  header:          { fontSize: 22, fontWeight: 'bold' },
  addBtn:          { backgroundColor: '#FF6B35', padding: 10,
                     paddingHorizontal: 16, borderRadius: 8 },
  addBtnText:      { color: '#fff', fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', borderRadius: 12,
                     padding: 16, marginBottom: 12 },
  cardLow:         { borderLeftWidth: 4, borderLeftColor: '#e65100' },
  cardOut:         { borderLeftWidth: 4, borderLeftColor: '#c62828' },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', marginBottom: 8 },
  itemName:        { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  statusBadge:     { fontSize: 13, fontWeight: 'bold' },
  stockRow:        { flexDirection: 'row', justifyContent: 'space-between',
                     marginBottom: 4 },
  stockText:       { fontSize: 14, color: '#555' },
  minText:         { fontSize: 13, color: '#888' },
  usageText:       { fontSize: 12, color: '#aaa', marginBottom: 4 },
  supplierText:    { fontSize: 12, color: '#888', marginBottom: 4 },
  actions:         { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn:         { flex: 2, padding: 10, borderRadius: 8,
                     backgroundColor: '#e3f2fd', alignItems: 'center' },
  editBtnText:     { color: '#1565c0', fontWeight: 'bold', fontSize: 13 },
  restockBtn:      { flex: 2, padding: 10, borderRadius: 8,
                     backgroundColor: '#e8f5e9', alignItems: 'center' },
  restockBtnText:  { color: '#2e7d32', fontWeight: 'bold', fontSize: 13 },
  deleteBtn:       { flex: 1, padding: 10, borderRadius: 8,
                     backgroundColor: '#fce8e6', alignItems: 'center' },
  deleteBtnText:   { color: '#c62828', fontWeight: 'bold' },
  empty:           { textAlign: 'center', color: '#888', marginTop: 40 },
  inputLabel:      { fontSize: 13, color: '#888', marginBottom: 6 },
  unitBtn:         { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                     backgroundColor: '#f0f0f0', marginRight: 8 },
  unitBtnActive:   { backgroundColor: '#FF6B35' },
  unitText:        { fontSize: 13, color: '#555' },
  unitTextActive:  { color: '#fff', fontWeight: 'bold' },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                     justifyContent: 'flex-end' },
  modal:           { backgroundColor: '#fff', borderTopLeftRadius: 20,
                     borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle:      { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input:           { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                     padding: 12, marginBottom: 12, fontSize: 15 },
  modalBtns:       { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:       { flex: 1, padding: 14, borderRadius: 8,
                     borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText:   { color: '#555', fontWeight: 'bold' },
  saveBtn:         { flex: 1, padding: 14, borderRadius: 8,
                     backgroundColor: '#FF6B35', alignItems: 'center' },
  saveBtnText:     { color: '#fff', fontWeight: 'bold' },
});