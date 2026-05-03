import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const STATUS_COLORS = {
  PENDING:  { bg: '#fff3e0', text: '#e65100' },
  APPROVED: { bg: '#e8f5e9', text: '#2e7d32' },
  REJECTED: { bg: '#fce8e6', text: '#c62828' },
};

export default function RefundScreen() {
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [reason, setReason] = useState('');
  const [tab, setTab] = useState('payments');
  const [submitting, setSubmitting] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [payRes, refRes] = await Promise.all([
        api.get('/payment/my'),
        api.get('/payment/refunds/my'),
      ]);
      setPayments(payRes.data.filter(p => p.status === 'COMPLETED'));
      setRefunds(refRes.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please enter a reason for refund');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/payment/refund/request', {
        paymentId: selectedPayment._id,
        reason,
      });
      Alert.alert('Success', 'Refund request submitted successfully!');
      setModalVisible(false);
      setReason('');
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit refund');
    } finally {
      setSubmitting(false);
    }
  };

  const renderPayment = ({ item }) => {
    const existingRefund = refunds.find(r => 
      (r.payment?._id || r.payment) === item._id
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.txnId}>TXN: {item.transactionId}</Text>
          <Text style={styles.method}>{item.method}</Text>
        </View>
        <Text style={styles.amount}>{formatPrice(item.finalAmount)}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={[styles.refundBtn, existingRefund && styles.refundBtnDisabled]}
          onPress={() => {
            setSelectedPayment(item);
            setModalVisible(true);
          }}
          disabled={!!existingRefund}
        >
          <Text style={[styles.refundBtnText, existingRefund && styles.refundBtnTextDisabled]}>
            {existingRefund ? 'Refund Requested' : 'Request Refund'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRefund = ({ item }) => {
    const colors = STATUS_COLORS[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.txnId}>Refund Request</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.amount}>{formatPrice(item.amount)}</Text>
        <Text style={styles.reason}>Reason: {item.reason}</Text>
        {item.adminNote && (
          <Text style={styles.adminNote}>Admin Note: {item.adminNote}</Text>
        )}
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
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
      <Text style={styles.header}>Refunds</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'payments' && styles.tabActive]}
          onPress={() => setTab('payments')}
        >
          <Text style={[styles.tabText, tab === 'payments' && styles.tabTextActive]}>
            My Payments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'refunds' && styles.tabActive]}
          onPress={() => setTab('refunds')}
        >
          <Text style={[styles.tabText, tab === 'refunds' && styles.tabTextActive]}>
            My Refunds
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'payments' ? (
        <FlatList
          data={payments}
          keyExtractor={i => i._id}
          renderItem={renderPayment}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={fetchData}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.empty}>No completed payments found</Text>
          }
        />
      ) : (
        <FlatList
          data={refunds}
          keyExtractor={i => i._id}
          renderItem={renderRefund}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={fetchData}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.empty}>No refund requests yet</Text>
          }
        />
      )}

      {/* Refund Request Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Request Refund</Text>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalAmount}>
                Amount: {formatPrice(selectedPayment?.finalAmount)}
              </Text>
              <Text style={styles.modalMethod}>
                Method: {selectedPayment?.method}
              </Text>
              <TextInput
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Reason for refund *"
                value={reason}
                onChangeText={setReason}
                multiline
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => { setModalVisible(false); setReason(''); }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleRequestRefund}
                  disabled={submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitBtnText}>Submit</Text>
                  }
                </TouchableOpacity>
              </View>
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { fontSize: 24, fontWeight: 'bold', padding: 16 },
  tabs:         { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  tab:          { flex: 1, padding: 12, alignItems: 'center',
                  borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:    { borderBottomColor: '#FF6B35' },
  tabText:      { fontSize: 14, color: '#888' },
  tabTextActive:{ color: '#FF6B35', fontWeight: 'bold' },
  card:         { backgroundColor: '#fff', borderRadius: 12,
                  padding: 16, marginBottom: 12 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 8 },
  txnId:        { fontSize: 13, color: '#888' },
  method:       { fontSize: 13, color: '#FF6B35', fontWeight: 'bold' },
  amount:       { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  reason:       { fontSize: 13, color: '#555', marginBottom: 4 },
  adminNote:    { fontSize: 13, color: '#1565c0', marginBottom: 4 },
  date:         { fontSize: 12, color: '#aaa' },
  badge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText:    { fontSize: 12, fontWeight: 'bold' },
  refundBtn:    { marginTop: 12, padding: 10, borderRadius: 8,
                  backgroundColor: '#fce8e6', alignItems: 'center' },
  refundBtnText:{ color: '#c62828', fontWeight: 'bold' },
  refundBtnDisabled: { backgroundColor: '#f0f0f0' },
  refundBtnTextDisabled: { color: '#888' },
  empty:        { textAlign: 'center', color: '#888', marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                  justifyContent: 'flex-end' },
  modal:        { backgroundColor: '#fff', borderTopLeftRadius: 20,
                  borderTopRightRadius: 20, padding: 24 },
  modalTitle:   { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalAmount:  { fontSize: 16, color: '#FF6B35', fontWeight: 'bold', marginBottom: 4 },
  modalMethod:  { fontSize: 14, color: '#888', marginBottom: 16 },
  input:        { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                  padding: 12, marginBottom: 16, fontSize: 15 },
  modalBtns:    { flexDirection: 'row', gap: 12 },
  cancelBtn:    { flex: 1, padding: 14, borderRadius: 8,
                  borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText:{ color: '#555', fontWeight: 'bold' },
  submitBtn:    { flex: 1, padding: 14, borderRadius: 8,
                  backgroundColor: '#FF6B35', alignItems: 'center' },
  submitBtnText:{ color: '#fff', fontWeight: 'bold' },
});