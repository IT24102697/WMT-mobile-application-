import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, Modal, TextInput, ActivityIndicator
} from 'react-native';
import api from '../services/api';

export default function StaffApprovalScreen() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchPendingStaff(); }, []);

  const fetchPendingStaff = async () => {
    try {
      const res = await api.get('/auth/pending-staff');
      setStaff(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load pending staff');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approved) => {
    setProcessing(true);
    try {
      await api.put(`/auth/approve-staff/${selected._id}`, {
        approved, note
      });
      Alert.alert(
        'Success',
        `Staff member ${approved ? 'approved' : 'rejected'} successfully`
      );
      setModalVisible(false);
      setNote('');
      fetchPendingStaff();
    } catch (err) {
      Alert.alert('Error', 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const renderStaff = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Pending</Text>
        </View>
      </View>
      <Text style={styles.detail}>📧 {item.email}</Text>
      {item.mobile && <Text style={styles.detail}>📱 {item.mobile}</Text>}
      {item.jobRole && <Text style={styles.detail}>💼 {item.jobRole}</Text>}
      {item.department && <Text style={styles.detail}>🏢 {item.department}</Text>}
      <Text style={styles.date}>
        Applied: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        style={styles.reviewBtn}
        onPress={() => { setSelected(item); setModalVisible(true); }}
      >
        <Text style={styles.reviewBtnText}>Review Application</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Staff Approvals</Text>
      {staff.length > 0 && (
        <View style={styles.countBanner}>
          <Text style={styles.countText}>
            {staff.length} pending application{staff.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <FlatList
        data={staff}
        keyExtractor={i => i._id}
        renderItem={renderStaff}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={fetchPendingStaff}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✅</Text>
            <Text style={styles.empty}>No pending staff applications</Text>
          </View>
        }
      />

      {/* Review Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Review Application</Text>
            <Text style={styles.modalName}>{selected?.name}</Text>
            <Text style={styles.modalDetail}>Email: {selected?.email}</Text>
            {selected?.jobRole && (
              <Text style={styles.modalDetail}>Role: {selected?.jobRole}</Text>
            )}
            {selected?.department && (
              <Text style={styles.modalDetail}>Department: {selected?.department}</Text>
            )}
            <TextInput
              style={styles.input}
              placeholder="Note (optional — sent to applicant)"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => handleApprove(false)}
                disabled={processing}
              >
                <Text style={styles.rejectBtnText}>❌ Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleApprove(true)}
                disabled={processing}
              >
                {processing
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.approveBtnText}>✅ Approve</Text>
                }
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => { setModalVisible(false); setNote(''); }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { fontSize: 24, fontWeight: 'bold', padding: 16 },
  countBanner:    { backgroundColor: '#fff3e0', marginHorizontal: 16,
                    padding: 12, borderRadius: 10, marginBottom: 8 },
  countText:      { color: '#e65100', fontWeight: 'bold', textAlign: 'center' },
  card:           { backgroundColor: '#fff', borderRadius: 12,
                    padding: 16, marginBottom: 12 },
  cardTop:        { flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 8 },
  name:           { fontSize: 16, fontWeight: 'bold', color: '#333' },
  pendingBadge:   { backgroundColor: '#fff3e0', paddingHorizontal: 10,
                    paddingVertical: 4, borderRadius: 12 },
  pendingText:    { color: '#e65100', fontSize: 12, fontWeight: 'bold' },
  detail:         { fontSize: 14, color: '#555', marginBottom: 4 },
  date:           { fontSize: 12, color: '#aaa', marginTop: 4 },
  reviewBtn:      { marginTop: 12, padding: 12, borderRadius: 8,
                    backgroundColor: '#e3f2fd', alignItems: 'center' },
  reviewBtnText:  { color: '#1565c0', fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon:      { fontSize: 48, marginBottom: 16 },
  empty:          { textAlign: 'center', color: '#888', fontSize: 16 },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'flex-end' },
  modal:          { backgroundColor: '#fff', borderTopLeftRadius: 20,
                    borderTopRightRadius: 20, padding: 24 },
  modalTitle:     { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalName:      { fontSize: 16, fontWeight: 'bold', color: '#FF6B35',
                    marginBottom: 8 },
  modalDetail:    { fontSize: 14, color: '#555', marginBottom: 4 },
  input:          { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                    padding: 12, marginTop: 12, marginBottom: 16,
                    fontSize: 15, minHeight: 80 },
  modalBtns:      { flexDirection: 'row', gap: 12, marginBottom: 12 },
  rejectBtn:      { flex: 1, padding: 14, borderRadius: 8,
                    backgroundColor: '#fce8e6', alignItems: 'center' },
  rejectBtnText:  { color: '#c62828', fontWeight: 'bold' },
  approveBtn:     { flex: 1, padding: 14, borderRadius: 8,
                    backgroundColor: '#FF6B35', alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn:      { padding: 14, borderRadius: 8,
                    borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  cancelBtnText:  { color: '#555', fontWeight: 'bold' },
});