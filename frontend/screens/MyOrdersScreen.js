import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const STATUS_COLORS = {
  PENDING:   { bg: '#fff3e0', text: '#e65100' },
  PREPARING: { bg: '#e3f2fd', text: '#1565c0' },
  READY:     { bg: '#e8f5e9', text: '#2e7d32' },
  DELIVERED: { bg: '#f3e5f5', text: '#6a1b9a' },
  CANCELLED: { bg: '#fce8e6', text: '#c62828' },
};

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      setOrders(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (orderId) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: async () => {
        try {
          await api.put(`/orders/${orderId}/cancel`);
          fetchOrders();
        } catch (err) {
          Alert.alert('Error', err.response?.data?.message || 'Cannot cancel');
        }
      }}
    ]);
  };

  const renderOrder = ({ item }) => {
    const colors = STATUS_COLORS[item.status];
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>
            Order #{item._id.slice(-6).toUpperCase()}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {item.items.map((i, idx) => (
          <Text key={idx} style={styles.itemRow}>
            • {i.name} x{i.quantity} — {formatPrice(i.unitPrice * i.quantity)}
          </Text>
        ))}

        <View style={styles.cardBottom}>
          <Text style={styles.total}>Total: {formatPrice(item.totalAmount)}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {item.status === 'PENDING' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item._id)}
          >
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        {item.paymentStatus === 'UNPAID' && item.status !== 'CANCELLED' && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => navigation.navigate('Payment', { order: item })}
          >
            <Text style={styles.payBtnText}>Pay Now</Text>
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
      <Text style={styles.header}>My Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={i => i._id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={fetchOrders}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.empty}>No orders yet</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f5f5' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { fontSize: 24, fontWeight: 'bold', padding: 16 },
  card:          { backgroundColor: '#fff', borderRadius: 12,
                   padding: 16, marginBottom: 12 },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between',
                   alignItems: 'center', marginBottom: 12 },
  orderId:       { fontSize: 15, fontWeight: 'bold', color: '#333' },
  badge:         { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText:     { fontSize: 12, fontWeight: 'bold' },
  itemRow:       { fontSize: 14, color: '#555', marginBottom: 4 },
  cardBottom:    { flexDirection: 'row', justifyContent: 'space-between',
                   marginTop: 12, paddingTop: 12,
                   borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  total:         { fontSize: 15, fontWeight: 'bold', color: '#FF6B35' },
  date:          { fontSize: 13, color: '#888' },
  cancelBtn:     { marginTop: 12, padding: 10, borderRadius: 8,
                   borderWidth: 1, borderColor: '#ff4444', alignItems: 'center' },
  cancelBtnText: { color: '#ff4444', fontWeight: 'bold' },
  payBtn:        { marginTop: 12, padding: 10, borderRadius: 8,
                   backgroundColor: '#FF6B35', alignItems: 'center' },
  payBtnText:    { color: '#fff', fontWeight: 'bold' },
  empty:         { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
});