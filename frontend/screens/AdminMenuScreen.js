import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORIES = ['BREAKFAST','LUNCH','DINNER','DRINKS','DESSERTS','SNACKS'];

export default function AdminMenuScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('LUNCH');
  const [saving, setSaving] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await api.get('/menu');
      setItems(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setName(''); setDescription(''); setPrice(''); setCategory('LUNCH');
    setModalVisible(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setName(item.name); setDescription(item.description || '');
    setPrice(String(item.price)); setCategory(item.category);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !price || !category) {
      Alert.alert('Error', 'Name, price and category are required');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/menu/${editing._id}`, { name, description, price: Number(price), category });
      } else {
        await api.post('/menu', { name, description, price: Number(price), category });
      }
      setModalVisible(false);
      fetchItems();
    } catch (err) {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Alert.alert('Delete', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await api.delete(`/menu/${item._id}`);
        fetchItems();
      }}
    ]);
  };

  const handleToggle = async (item) => {
    await api.put(`/menu/toggle/${item._id}`);
    fetchItems();
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={[styles.badge, item.available ? styles.badgeGreen : styles.badgeRed]}>
          {item.available ? 'Available' : 'Unavailable'}
        </Text>
      </View>
      <Text style={styles.itemCategory}>{item.category}</Text>
      <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleBtn} onPress={() => handleToggle(item)}>
          <Text style={styles.toggleBtnText}>
            {item.available ? 'Disable' : 'Enable'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
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
        <Text style={styles.header}>Menu Management</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No menu items yet</Text>}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          style={styles.modalOverlay}
          keyboardVerticalOffset={0}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Item' : 'Add New Item'}</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <TextInput style={styles.input} placeholder="Item Name *"
                value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="Description"
                value={description} onChangeText={setDescription} multiline />
              <TextInput style={styles.input} placeholder="Price *"
                value={price} onChangeText={setPrice} keyboardType="numeric" />

              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat}
                    style={[styles.catBtn, category === cat && styles.catBtnActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                  {saving
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.saveBtnText}>Save</Text>
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
  container:     { flex: 1, backgroundColor: '#f5f5f5' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:        { flexDirection: 'row', justifyContent: 'space-between',
                   alignItems: 'center', padding: 16 },
  header:        { fontSize: 22, fontWeight: 'bold' },
  addBtn:        { backgroundColor: '#FF6B35', padding: 10,
                   paddingHorizontal: 16, borderRadius: 8 },
  addBtnText:    { color: '#fff', fontWeight: 'bold' },
  card:          { backgroundColor: '#fff', borderRadius: 12,
                   padding: 16, marginBottom: 12 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between',
                   alignItems: 'center' },
  itemName:      { fontSize: 16, fontWeight: 'bold', flex: 1 },
  badge:         { fontSize: 12, paddingHorizontal: 10, paddingVertical: 4,
                   borderRadius: 12, overflow: 'hidden' },
  badgeGreen:    { backgroundColor: '#e6f4ea', color: '#2e7d32' },
  badgeRed:      { backgroundColor: '#fce8e6', color: '#c62828' },
  itemCategory:  { color: '#FF6B35', fontSize: 12, marginTop: 4 },
  itemPrice:     { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },
  actions:       { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn:       { flex: 1, padding: 8, borderRadius: 8,
                   backgroundColor: '#e3f2fd', alignItems: 'center' },
  editBtnText:   { color: '#1565c0', fontWeight: 'bold' },
  toggleBtn:     { flex: 1, padding: 8, borderRadius: 8,
                   backgroundColor: '#fff3e0', alignItems: 'center' },
  toggleBtnText: { color: '#e65100', fontWeight: 'bold' },
  deleteBtn:     { flex: 1, padding: 8, borderRadius: 8,
                   backgroundColor: '#fce8e6', alignItems: 'center' },
  deleteBtnText: { color: '#c62828', fontWeight: 'bold' },
  empty:         { textAlign: 'center', color: '#888', marginTop: 40 },
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                   justifyContent: 'flex-end' },
  modal:         { backgroundColor: '#fff', borderTopLeftRadius: 20,
                   borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalTitle:    { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input:         { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                   padding: 12, marginBottom: 12, fontSize: 15 },
  label:         { fontSize: 13, color: '#888', marginBottom: 8 },
  catBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                   backgroundColor: '#f5f5f5', marginRight: 8, marginBottom: 16 },
  catBtnActive:  { backgroundColor: '#FF6B35' },
  catText:       { fontSize: 13, color: '#555' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  modalBtns:     { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn:     { flex: 1, padding: 14, borderRadius: 8,
                   borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: 'bold' },
  saveBtn:       { flex: 1, padding: 14, borderRadius: 8,
                   backgroundColor: '#FF6B35', alignItems: 'center' },
  saveBtnText:   { color: '#fff', fontWeight: 'bold' },
});