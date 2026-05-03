import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const STATUS_COLORS = {
  PENDING:  { bg: '#fff3e0', text: '#e65100' },
  APPROVED: { bg: '#e8f5e9', text: '#2e7d32' },
  REJECTED: { bg: '#fce8e6', text: '#c62828' },
};

export default function AdminRefundScreen() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState('PENDING');
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchRefunds(); }, []);

  const fetchRefunds = async () => {
    try {
      const res = await api.get('/payment/refunds/all');
      setRefunds(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (status) => {
    setProcessing(true);
    try {
      await api.put(`/payment/refund/process/${selected._id}`, {
        status, adminNote
      });
      Alert.alert('Success', `Refund ${status.toLowerCase()} successfully`);
      setModalVisible(false);
      setAdminNote('');
      fetchRefunds();
    } catch (err) {
      Alert.alert('Error', 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = filter === 'ALL'
    ? refunds
    : refunds.filter(r => r.status === filter);

  const renderRefund = ({ item }) => {
    const colors = STATUS_COLORS[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.customerName}>
            👤 {item.customer?.name || 'Customer'}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatPrice(item.amount)}</Text>
        <Text style={styles.reason}>Reason: {item.reason}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        {item.status === 'PENDING' && (
          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => { setSelected(item); setModalVisible(true); }}
          >
            <Text style={styles.reviewBtnText}>Review Request</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Refund Requests</Text>

      {/* Filter */}
      <View style={styles.filterRow}>
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={renderRefund}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={fetchRefunds}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.empty}>No refund requests found</Text>
        }
      />

      {/* Review Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Review Refund</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalCustomer}>
                Customer: {selected?.customer?.name}
              </Text>
              <Text style={styles.modalAmount}>
                Amount: {formatPrice(selected?.amount)}
              </Text>
              <Text style={styles.modalReason}>
                Reason: {selected?.reason}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Admin note (optional)"
                value={adminNote}
                onChangeText={setAdminNote}
                multiline
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  onPress={() => handleProcess('REJECTED')}
                  disabled={processing}
                >
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleProcess('APPROVED')}
                  disabled={processing}
                >
                  {processing
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.approveBtnText}>Approve</Text>
                  }
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setModalVisible(false); setAdminNote(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
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
  header:          { fontSize: 24, fontWeight: 'bold', padding: 16 },
  filterRow:       { flexDirection: 'row', paddingHorizontal: 16,
                     gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  filterBtn:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                     backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  filterBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  filterText:      { fontSize: 12, color: '#555' },
  filterTextActive:{ color: '#fff', fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', borderRadius: 12,
                     padding: 16, marginBottom: 12 },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', marginBottom: 8 },
  customerName:    { fontSize: 15, fontWeight: 'bold', color: '#333' },
  badge:           { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:       { fontSize: 12, fontWeight: 'bold' },
  amount:          { fontSize: 20, fontWeight: 'bold', color: '#FF6B35', marginBottom: 4 },
  reason:          { fontSize: 13, color: '#555', marginBottom: 4 },
  date:            { fontSize: 12, color: '#aaa' },
  reviewBtn:       { marginTop: 12, padding: 10, borderRadius: 8,
                     backgroundColor: '#e3f2fd', alignItems: 'center' },
  reviewBtnText:   { color: '#1565c0', fontWeight: 'bold' },
  empty:           { textAlign: 'center', color: '#888', marginTop: 40 },
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                     justifyContent: 'flex-end' },
  modal:           { backgroundColor: '#fff', borderTopLeftRadius: 20,
                     borderTopRightRadius: 20, padding: 24 },
  modalTitle:      { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalCustomer:   { fontSize: 15, color: '#333', marginBottom: 4 },
  modalAmount:     { fontSize: 16, fontWeight: 'bold', color: '#FF6B35', marginBottom: 4 },
  modalReason:     { fontSize: 14, color: '#555', marginBottom: 16 },
  input:           { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                     padding: 12, marginBottom: 16, fontSize: 15, minHeight: 80 },
  modalBtns:       { flexDirection: 'row', gap: 12, marginBottom: 12 },
  rejectBtn:       { flex: 1, padding: 14, borderRadius: 8,
                     backgroundColor: '#fce8e6', alignItems: 'center' },
  rejectBtnText:   { color: '#c62828', fontWeight: 'bold' },
  approveBtn:      { flex: 1, padding: 14, borderRadius: 8,
                     backgroundColor: '#FF6B35', alignItems: 'center' },
  approveBtnText:  { color: '#fff', fontWeight: 'bold' },
  cancelBtn:       { padding: 14, borderRadius: 8,
                     borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText:   { color: '#555', fontWeight: 'bold' },
});