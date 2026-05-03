import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

export default function AdminDiscountScreen() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [percent, setPercent] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchDiscounts(); }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/trust/discounts');
      setDiscounts(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setCode(''); setDescription('');
    setPercent(''); setMinOrder('');
    setUsageLimit('');
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setCode(item.code);
    setDescription(item.description || '');
    setPercent(String(item.percent));
    setMinOrder(String(item.minOrder));
    setUsageLimit(String(item.usageLimit));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!code || !percent) {
      Alert.alert('Error', 'Code and percent are required');
      return;
    }
    const numPercent = Number(percent);
    if (isNaN(numPercent) || numPercent <= 0 || numPercent > 100) {
      Alert.alert('Error', 'Percent must be a number between 1 and 100');
      return;
    }
    if (minOrder && (isNaN(Number(minOrder)) || Number(minOrder) < 0)) {
      Alert.alert('Error', 'Minimum order must be a valid positive number');
      return;
    }
    if (usageLimit && (isNaN(Number(usageLimit)) || Number(usageLimit) <= 0)) {
      Alert.alert('Error', 'Usage limit must be a valid positive number');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/trust/discount/${editing._id}`, {
          description,
          percent: Number(percent),
          minOrder: Number(minOrder) || 0,
          usageLimit: Number(usageLimit) || 100,
        });
      } else {
        await api.post('/trust/discount', {
          code, description,
          percent: Number(percent),
          minOrder: Number(minOrder) || 0,
          usageLimit: Number(usageLimit) || 100,
        });
      }
      setModalVisible(false);
      fetchDiscounts();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', `Delete discount "${item.code}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/trust/discount/${item._id}`);
          fetchDiscounts();
        } catch (err) {
          Alert.alert('Error', 'Failed to delete discount');
        }
      }}
    ]);
  };

  const handleToggle = async (id) => {
    await api.put(`/trust/discount/toggle/${id}`);
    fetchDiscounts();
  };

  const renderDiscount = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.code}>{item.code}</Text>
        <View style={[styles.badge,
          item.active ? styles.badgeGreen : styles.badgeRed]}>
          <Text style={[styles.badgeText,
            item.active ? styles.badgeTextGreen : styles.badgeTextRed]}>
            {item.active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.desc}>{item.description}</Text>
      )}
      <Text style={styles.detail}>{item.percent}% off</Text>
      {item.minOrder > 0 && (
        <Text style={styles.detail}>Min order: {formatPrice(item.minOrder)}</Text>
      )}
      <Text style={styles.detail}>
        Used: {item.usageCount}/{item.usageLimit}
      </Text>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => openEdit(item)}
        >
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn,
            item.active ? styles.toggleBtnRed : styles.toggleBtnGreen]}
          onPress={() => handleToggle(item._id)}
        >
          <Text style={[styles.toggleBtnText,
            item.active ? styles.toggleTextRed : styles.toggleTextGreen]}>
            {item.active ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
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
        <Text style={styles.header}>Discounts</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={discounts}
        keyExtractor={i => i._id}
        renderItem={renderDiscount}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No discounts created yet</Text>
        }
      />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editing ? 'Edit Discount' : 'Create Discount'}
            </Text>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Code field only shown when adding */}
              {!editing && (
                <TextInput style={styles.input}
                  placeholder="Discount Code * (e.g. SAVE20)"
                  value={code} onChangeText={setCode}
                  autoCapitalize="characters" />
              )}
              {editing && (
                <View style={styles.codeDisplay}>
                  <Text style={styles.codeDisplayLabel}>Code</Text>
                  <Text style={styles.codeDisplayValue}>{editing.code}</Text>
                </View>
              )}
              <TextInput style={styles.input}
                placeholder="Description"
                value={description} onChangeText={setDescription} />
              <TextInput style={styles.input}
                placeholder="Discount Percent * (e.g. 10)"
                value={percent} onChangeText={setPercent}
                keyboardType="numeric" />
              <TextInput style={styles.input}
                placeholder="Minimum Order Amount"
                value={minOrder} onChangeText={setMinOrder}
                keyboardType="numeric" />
              <TextInput style={styles.input}
                placeholder="Usage Limit (e.g. 100)"
                value={usageLimit} onChangeText={setUsageLimit}
                keyboardType="numeric" />

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
                        {editing ? 'Update' : 'Create'}
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
  container:        { flex: 1, backgroundColor: '#f5f5f5' },
  center:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:           { flexDirection: 'row', justifyContent: 'space-between',
                      alignItems: 'center', padding: 16 },
  header:           { fontSize: 22, fontWeight: 'bold' },
  addBtn:           { backgroundColor: '#FF6B35', padding: 10,
                      paddingHorizontal: 16, borderRadius: 8 },
  addBtnText:       { color: '#fff', fontWeight: 'bold' },
  card:             { backgroundColor: '#fff', borderRadius: 12,
                      padding: 16, marginBottom: 12 },
  cardTop:          { flexDirection: 'row', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 8 },
  code:             { fontSize: 18, fontWeight: 'bold',
                      color: '#FF6B35', letterSpacing: 1 },
  badge:            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeGreen:       { backgroundColor: '#e8f5e9' },
  badgeRed:         { backgroundColor: '#fce8e6' },
  badgeText:        { fontSize: 12, fontWeight: 'bold' },
  badgeTextGreen:   { color: '#2e7d32' },
  badgeTextRed:     { color: '#c62828' },
  desc:             { fontSize: 14, color: '#555', marginBottom: 6 },
  detail:           { fontSize: 13, color: '#888', marginBottom: 4 },
  actions:          { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn:          { flex: 1, padding: 10, borderRadius: 8,
                      backgroundColor: '#e3f2fd', alignItems: 'center' },
  editBtnText:      { color: '#1565c0', fontWeight: 'bold' },
  toggleBtn:        { flex: 1, padding: 10, borderRadius: 8,
                      alignItems: 'center' },
  toggleBtnGreen:   { backgroundColor: '#e8f5e9' },
  toggleBtnRed:     { backgroundColor: '#fff3e0' },
  toggleBtnText:    { fontWeight: 'bold' },
  toggleTextGreen:  { color: '#2e7d32' },
  toggleTextRed:    { color: '#e65100' },
  deleteBtn:        { flex: 1, padding: 10, borderRadius: 8,
                      backgroundColor: '#fce8e6', alignItems: 'center' },
  deleteBtnText:    { color: '#c62828', fontWeight: 'bold' },
  empty:            { textAlign: 'center', color: '#888', marginTop: 40 },
  modalOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                      justifyContent: 'flex-end' },
  modal:            { backgroundColor: '#fff', borderTopLeftRadius: 20,
                      borderTopRightRadius: 20, padding: 24, maxHeight: '90%' },
  modalTitle:       { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  codeDisplay:      { backgroundColor: '#f5f5f5', borderRadius: 8,
                      padding: 12, marginBottom: 12 },
  codeDisplayLabel: { fontSize: 12, color: '#888' },
  codeDisplayValue: { fontSize: 16, fontWeight: 'bold',
                      color: '#FF6B35', marginTop: 2 },
  input:            { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                      padding: 12, marginBottom: 12, fontSize: 15 },
  modalBtns:        { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:        { flex: 1, padding: 14, borderRadius: 8,
                      borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText:    { color: '#555', fontWeight: 'bold' },
  saveBtn:          { flex: 1, padding: 14, borderRadius: 8,
                      backgroundColor: '#FF6B35', alignItems: 'center' },
  saveBtnText:      { color: '#fff', fontWeight: 'bold' },
});