import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  TextInput, Platform
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const STATUSES = ['ALL','PENDING','PREPARING','READY','DELIVERED','CANCELLED'];

const STATUS_COLORS = {
  PENDING:   { bg: '#fff3e0', text: '#e65100' },
  PREPARING: { bg: '#e3f2fd', text: '#1565c0' },
  READY:     { bg: '#e8f5e9', text: '#2e7d32' },
  DELIVERED: { bg: '#f3e5f5', text: '#6a1b9a' },
  CANCELLED: { bg: '#fce8e6', text: '#c62828' },
};

export default function StaffOrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [searching, setSearching] = useState(false);
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchOrders(); }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = '/orders?';
      if (filter !== 'ALL') url += `status=${filter}&`;
      if (date) url += `date=${date}&`;
      const res = await api.get(url);
      setOrders(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      let url = '/orders?';
      if (search) url += `search=${search}&`;
      if (date) url += `date=${date}&`;
      if (filter !== 'ALL') url += `status=${filter}&`;
      const res = await api.get(url);
      setOrders(res.data);
    } catch (err) {
      Alert.alert('Error', 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setDate('');
    fetchOrders();
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const renderOrder = ({ item }) => {
    const colors = STATUS_COLORS[item.status];
    const nextStatus = {
      PENDING:   'PREPARING',
      PREPARING: 'READY',
      READY:     'DELIVERED',
    }[item.status];

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>
            #{item._id.slice(-6).toUpperCase()}
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.customerName}>
          👤 {item.customer?.name || 'Customer'}
        </Text>
        <Text style={styles.customerEmail}>
          📧 {item.customer?.email || ''}
        </Text>

        {item.tableNumber && (
          <Text style={styles.table}>🪑 Table: {item.tableNumber}</Text>
        )}

        {item.items.map((i, idx) => (
          <Text key={idx} style={styles.itemRow}>
            • {i.name} x{i.quantity} — {formatPrice(i.unitPrice * i.quantity)}
          </Text>
        ))}

        {item.specialRequest && (
          <Text style={styles.special}>📝 {item.specialRequest}</Text>
        )}

        <View style={styles.cardBottom}>
          <Text style={styles.total}>{formatPrice(item.totalAmount)}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {nextStatus && (
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => updateStatus(item._id, nextStatus)}
          >
            <Text style={styles.nextBtnText}>
              Mark as {nextStatus} →
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Orders</Text>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by order ID or name..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          {searching
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.searchBtnText}>🔍</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Date Filter */}
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput}
          placeholder="Filter by date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
        />
        <TouchableOpacity style={styles.dateBtn} onPress={handleSearch}>
          <Text style={styles.dateBtnText}>Apply</Text>
        </TouchableOpacity>
        {(search || date) && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSearch}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <FlatList
        horizontal
        data={STATUSES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        style={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterBtn, filter === item && styles.filterBtnActive]}
            onPress={() => setFilter(item)}
          >
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={i => i._id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={fetchOrders}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={styles.empty}>No orders found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:          { fontSize: 24, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  searchRow:       { flexDirection: 'row', paddingHorizontal: 16,
                     gap: 8, marginBottom: 8 },
  searchInput:     { flex: 1, borderWidth: 1, borderColor: '#ddd',
                     borderRadius: 10, padding: 10, fontSize: 14,
                     backgroundColor: '#fff' },
  searchBtn:       { backgroundColor: '#FF6B35', paddingHorizontal: 16,
                     borderRadius: 10, justifyContent: 'center' },
  searchBtnText:   { fontSize: 18 },
  dateRow:         { flexDirection: 'row', paddingHorizontal: 16,
                     gap: 8, marginBottom: 8 },
  dateInput:       { flex: 1, borderWidth: 1, borderColor: '#ddd',
                     borderRadius: 10, padding: 10, fontSize: 13,
                     backgroundColor: '#fff' },
  dateBtn:         { backgroundColor: '#333', paddingHorizontal: 12,
                     borderRadius: 10, justifyContent: 'center' },
  dateBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  clearBtn:        { backgroundColor: '#f0f0f0', paddingHorizontal: 12,
                     borderRadius: 10, justifyContent: 'center' },
  clearBtnText:    { color: '#555', fontWeight: 'bold', fontSize: 13 },
  filterList:      { paddingHorizontal: 16, marginBottom: 8 },
  filterBtn:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                     backgroundColor: '#fff', marginRight: 8,
                     borderWidth: 1, borderColor: '#ddd' },
  filterBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  filterText:      { fontSize: 12, color: '#555' },
  filterTextActive:{ color: '#fff', fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', borderRadius: 12,
                     padding: 16, marginBottom: 12 },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', marginBottom: 8 },
  orderId:         { fontSize: 16, fontWeight: 'bold' },
  badge:           { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText:       { fontSize: 12, fontWeight: 'bold' },
  customerName:    { fontSize: 14, color: '#333', marginBottom: 2 },
  customerEmail:   { fontSize: 12, color: '#888', marginBottom: 4 },
  table:           { fontSize: 13, color: '#888', marginBottom: 4 },
  itemRow:         { fontSize: 14, color: '#333', marginBottom: 2 },
  special:         { fontSize: 13, color: '#FF6B35', marginTop: 4 },
  cardBottom:      { flexDirection: 'row', justifyContent: 'space-between',
                     marginTop: 8, paddingTop: 8,
                     borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  total:           { fontSize: 16, fontWeight: 'bold', color: '#333' },
  date:            { fontSize: 13, color: '#888' },
  nextBtn:         { backgroundColor: '#FF6B35', padding: 12,
                     borderRadius: 8, marginTop: 12, alignItems: 'center' },
  nextBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  empty:           { textAlign: 'center', color: '#888', marginTop: 40 },
});