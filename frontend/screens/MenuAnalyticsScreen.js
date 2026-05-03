import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import api from '../services/api';

export default function MenuAnalyticsScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/menu/analytics');
      setData(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📊 Menu Analytics</Text>

      {/* Summary Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{data?.totalItems}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#e8f5e9' }]}>
          <Text style={[styles.statNum, { color: '#2e7d32' }]}>
            {data?.availableItems}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
          <Text style={[styles.statNum, { color: '#e65100' }]}>
            {data?.totalOrders}
          </Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
      </View>

      {/* Top Items Overall */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏆 Best Selling Items (Overall)</Text>
        {data?.topItems?.map((item, idx) => (
          <View key={item._id} style={styles.rankRow}>
            <View style={[styles.rank,
              idx === 0 ? styles.rank1 :
              idx === 1 ? styles.rank2 :
              idx === 2 ? styles.rank3 : styles.rankN]}>
              <Text style={styles.rankText}>#{idx + 1}</Text>
            </View>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemCount}>{item.orderCount} orders</Text>
          </View>
        ))}
        {data?.topItems?.length === 0 && (
          <Text style={styles.empty}>No order data yet</Text>
        )}
      </View>

      {/* Weekly Top */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 This Week's Top Items</Text>
        {data?.weeklyTop?.length > 0 ? (
          data.weeklyTop.map((item, idx) => (
            <View key={idx} style={styles.rankRow}>
              <Text style={styles.weeklyRank}>#{idx + 1}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemCount}>{item.count} sold</Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No orders this week yet</Text>
        )}
      </View>

      {/* Monthly Top */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📆 This Month's Top Items</Text>
        {data?.monthlyTop?.length > 0 ? (
          data.monthlyTop.map((item, idx) => (
            <View key={idx} style={styles.rankRow}>
              <Text style={styles.weeklyRank}>#{idx + 1}</Text>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemCount}>{item.count} sold</Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>No orders this month yet</Text>
        )}
      </View>

      {/* Category Breakdown */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍽️ Orders by Category</Text>
        {data?.categoryStats?.map((cat, idx) => {
          const maxOrders = Math.max(...data.categoryStats.map(c => c.totalOrders), 1);
          const pct = (cat.totalOrders / maxOrders) * 100;
          return (
            <View key={idx} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{cat._id}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${pct}%` }]} />
              </View>
              <Text style={styles.categoryCount}>{cat.totalOrders}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.refreshBtn} onPress={fetchAnalytics}>
        <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { fontSize: 24, fontWeight: 'bold', padding: 16 },
  statsRow:     { flexDirection: 'row', padding: 16, paddingTop: 0, gap: 8 },
  statCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 12,
                  padding: 12, alignItems: 'center' },
  statNum:      { fontSize: 24, fontWeight: 'bold', color: '#FF6B35' },
  statLabel:    { fontSize: 11, color: '#888', marginTop: 4 },
  card:         { backgroundColor: '#fff', margin: 16, marginTop: 0,
                  borderRadius: 12, padding: 16, marginBottom: 12 },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  rankRow:      { flexDirection: 'row', alignItems: 'center',
                  marginBottom: 12 },
  rank:         { width: 32, height: 32, borderRadius: 16,
                  alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rank1:        { backgroundColor: '#FFD700' },
  rank2:        { backgroundColor: '#C0C0C0' },
  rank3:        { backgroundColor: '#CD7F32' },
  rankN:        { backgroundColor: '#f0f0f0' },
  rankText:     { fontSize: 12, fontWeight: 'bold', color: '#333' },
  weeklyRank:   { width: 32, fontSize: 14, fontWeight: 'bold',
                  color: '#FF6B35', marginRight: 12 },
  itemName:     { flex: 1, fontSize: 14, color: '#333' },
  itemCount:    { fontSize: 13, color: '#FF6B35', fontWeight: 'bold' },
  categoryRow:  { marginBottom: 12 },
  categoryName: { fontSize: 13, color: '#555', marginBottom: 6 },
  barBg:        { height: 8, backgroundColor: '#f0f0f0',
                  borderRadius: 4, marginBottom: 4, overflow: 'hidden' },
  barFill:      { height: '100%', backgroundColor: '#FF6B35', borderRadius: 4 },
  categoryCount:{ fontSize: 12, color: '#888' },
  empty:        { textAlign: 'center', color: '#888', padding: 16 },
  refreshBtn:   { margin: 16, marginTop: 0, padding: 14, borderRadius: 10,
                  backgroundColor: '#fff', alignItems: 'center',
                  borderWidth: 1, borderColor: '#FF6B35' },
  refreshBtnText:{ color: '#FF6B35', fontWeight: 'bold' },
});