import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import api from '../services/api';

export default function InventoryScreen({ navigation }) {
  const [ingredients, setIngredients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [ingRes, sumRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/summary'),
      ]);
      setIngredients(ingRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'LOW'
    ? ingredients.filter(i => i.isLowStock && i.currentStock > 0)
    : filter === 'OUT'
    ? ingredients.filter(i => i.currentStock === 0)
    : filter === 'HEALTHY'
    ? ingredients.filter(i => !i.isLowStock)
    : ingredients;

  const getStatusStyle = (item) => {
    if (item.currentStock === 0) return { bg: '#fce8e6', text: '#c62828', label: '🔴 OUT OF STOCK' };
    if (item.isLowStock) return { bg: '#fff3e0', text: '#e65100', label: `🟡 LOW — Only ${item.currentStock} ${item.unit} left!` };
    return { bg: '#e8f5e9', text: '#2e7d32', label: `🟢 ${item.currentStock} ${item.unit}` };
  };

  const renderItem = ({ item }) => {
    const status = getStatusStyle(item);
    return (
      <View style={[styles.card,
        item.currentStock === 0 ? styles.cardOut :
        item.isLowStock ? styles.cardLow : null
      ]}>
        <View style={styles.cardTop}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.unit}>{item.unit}</Text>
        </View>

        {/* Stock level bar */}
        <View style={styles.barBg}>
          <View style={[styles.barFill, {
            width: `${Math.min(100, (item.currentStock / (item.minStock * 2)) * 100)}%`,
            backgroundColor: item.currentStock === 0 ? '#c62828' :
                            item.isLowStock ? '#e65100' : '#2e7d32'
          }]} />
        </View>

        {/* Status message */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>
            {status.label}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detail}>Min level: {item.minStock} {item.unit}</Text>
          {item.supplier && (
            <Text style={styles.detail}>Supplier: {item.supplier}</Text>
          )}
        </View>
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
      <View style={styles.topBar}>
        <Text style={styles.header}>Inventory Monitor</Text>
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={() => navigation.navigate('StockManagement')}
        >
          <Text style={styles.manageBtnText}>Manage Stock</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      {summary && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNum}>{summary.total}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#e8f5e9' }]}>
            <Text style={[styles.summaryNum, { color: '#2e7d32' }]}>{summary.healthy}</Text>
            <Text style={styles.summaryLabel}>Healthy</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={[styles.summaryNum, { color: '#e65100' }]}>{summary.lowStock}</Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#fce8e6' }]}>
            <Text style={[styles.summaryNum, { color: '#c62828' }]}>{summary.outOfStock}</Text>
            <Text style={styles.summaryLabel}>Out</Text>
          </View>
        </View>
      )}

      {/* Low stock alert banner */}
      {summary && (summary.lowStock > 0 || summary.outOfStock > 0) && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            ⚠️ Alert: {summary.outOfStock} items out of stock,
            {' '}{summary.lowStock} items running low!
          </Text>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filterRow}>
        {['ALL','HEALTHY','LOW','OUT'].map(f => (
          <TouchableOpacity key={f}
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
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={fetchData}
        refreshing={loading}
        ListEmptyComponent={
          <Text style={styles.empty}>No ingredients found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f5f5f5' },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar:          { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', padding: 16 },
  header:          { fontSize: 22, fontWeight: 'bold' },
  manageBtn:       { backgroundColor: '#333', padding: 10,
                     paddingHorizontal: 16, borderRadius: 8 },
  manageBtnText:   { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  summaryRow:      { flexDirection: 'row', paddingHorizontal: 16,
                     gap: 8, marginBottom: 8 },
  summaryCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 10,
                     padding: 10, alignItems: 'center' },
  summaryNum:      { fontSize: 20, fontWeight: 'bold', color: '#333' },
  summaryLabel:    { fontSize: 10, color: '#888', marginTop: 2 },
  alertBanner:     { backgroundColor: '#fce8e6', marginHorizontal: 16,
                     padding: 12, borderRadius: 10, marginBottom: 8 },
  alertText:       { color: '#c62828', fontWeight: 'bold', fontSize: 13 },
  filterRow:       { flexDirection: 'row', paddingHorizontal: 16,
                     gap: 8, marginBottom: 8 },
  filterBtn:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                     backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  filterBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  filterText:      { fontSize: 12, color: '#555' },
  filterTextActive:{ color: '#fff', fontWeight: 'bold' },
  card:            { backgroundColor: '#fff', borderRadius: 12,
                     padding: 16, marginBottom: 12 },
  cardLow:         { borderLeftWidth: 4, borderLeftColor: '#e65100' },
  cardOut:         { borderLeftWidth: 4, borderLeftColor: '#c62828' },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between',
                     alignItems: 'center', marginBottom: 8 },
  itemName:        { fontSize: 16, fontWeight: 'bold', color: '#333' },
  unit:            { fontSize: 13, color: '#888', backgroundColor: '#f0f0f0',
                     paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  barBg:           { height: 8, backgroundColor: '#f0f0f0',
                     borderRadius: 4, marginBottom: 8, overflow: 'hidden' },
  barFill:         { height: '100%', borderRadius: 4 },
  statusBanner:    { padding: 8, borderRadius: 8, marginBottom: 8 },
  statusText:      { fontSize: 13, fontWeight: 'bold' },
  detailRow:       { flexDirection: 'row', justifyContent: 'space-between' },
  detail:          { fontSize: 12, color: '#888' },
  empty:           { textAlign: 'center', color: '#888', marginTop: 40 },
});