import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function AdminDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [profileRes, inventoryRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/inventory/summary'),
      ]);
      setUser(profileRes.data);
      setSummary(inventoryRes.data);
    } catch (err) {
      navigation.replace('Login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.name}>{user?.name} 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Inventory Summary */}
      {summary && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{summary.total}</Text>
            <Text style={styles.statLabel}>Ingredients</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}>
            <Text style={[styles.statNum, { color: '#e65100' }]}>
              {summary.lowStock}
            </Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#fce8e6' }]}>
            <Text style={[styles.statNum, { color: '#c62828' }]}>
              {summary.outOfStock}
            </Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>
      )}

      {/* Admin Actions */}
      <Text style={styles.sectionTitle}>Management</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.gridItem, styles.gridOrange]}
          onPress={() => navigation.navigate('AdminMenu')}
        >
          <Text style={styles.gridIcon}>🍔</Text>
          <Text style={styles.gridLabel}>Menu Management</Text>
          <Text style={styles.gridSub}>Add, edit, delete items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, styles.gridBlue]}
          onPress={() => navigation.navigate('StaffOrders')}
        >
          <Text style={styles.gridIcon}>📋</Text>
          <Text style={styles.gridLabel}>All Orders</Text>
          <Text style={styles.gridSub}>View & manage orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, styles.gridGreen]}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={styles.gridIcon}>📦</Text>
          <Text style={styles.gridLabel}>Inventory</Text>
          <Text style={styles.gridSub}>Manage stock levels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, styles.gridPurple]}
          onPress={() => navigation.navigate('AdminDiscount')}
        >
          <Text style={styles.gridIcon}>🏷️</Text>
          <Text style={styles.gridLabel}>Discounts</Text>
          <Text style={styles.gridSub}>Create & manage codes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, styles.gridYellow]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.gridIcon}>👤</Text>
          <Text style={styles.gridLabel}>My Profile</Text>
          <Text style={styles.gridSub}>Edit your details</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={[styles.gridItem, styles.gridRed]}
  onPress={() => navigation.navigate('StaffApproval')}
>
  <Text style={styles.gridIcon}>👨‍💼</Text>
  <Text style={styles.gridLabel}>Staff Approvals</Text>
  <Text style={styles.gridSub}>Approve new staff</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.gridItem, styles.gridOrange]}
  onPress={() => navigation.navigate('AdminRefund')}
>
  <Text style={styles.gridIcon}>💰</Text>
  <Text style={styles.gridLabel}>Refund Requests</Text>
  <Text style={styles.gridSub}>Review refunds</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.gridItem, styles.gridBlue]}
  onPress={() => navigation.navigate('MenuAnalytics')}
>
  <Text style={styles.gridIcon}>📊</Text>
  <Text style={styles.gridLabel}>Menu Analytics</Text>
  <Text style={styles.gridSub}>Sales & trends</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.gridItem, styles.gridGreen]}
  onPress={() => navigation.navigate('StockManagement')}
>
  <Text style={styles.gridIcon}>📋</Text>
  <Text style={styles.gridLabel}>Stock Management</Text>
  <Text style={styles.gridSub}>Add, edit, delete stock</Text>
</TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { flexDirection: 'row', justifyContent: 'space-between',
                  alignItems: 'center', padding: 24,
                  backgroundColor: '#FF6B35' },
  greeting:     { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  name:         { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  logoutBtn:    { padding: 8, paddingHorizontal: 16, borderRadius: 8,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  logoutText:   { color: '#fff', fontSize: 13 },
  statsRow:     { flexDirection: 'row', padding: 16,
                  paddingBottom: 8, gap: 8 },
  statCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 10,
                  padding: 12, alignItems: 'center' },
  statNum:      { fontSize: 24, fontWeight: 'bold', color: '#333' },
  statLabel:    { fontSize: 11, color: '#888', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333',
                  paddingHorizontal: 16, paddingBottom: 12 },
  grid:         { paddingHorizontal: 16, gap: 12 },
  gridItem:     { borderRadius: 12, padding: 20, marginBottom: 4 },
  gridOrange:   { backgroundColor: '#fff3e0' },
  gridBlue:     { backgroundColor: '#e3f2fd' },
  gridGreen:    { backgroundColor: '#e8f5e9' },
  gridPurple:   { backgroundColor: '#f3e5f5' },
  gridYellow:   { backgroundColor: '#fffde7' },
  gridIcon:     { fontSize: 32, marginBottom: 8 },
  gridLabel:    { fontSize: 16, fontWeight: 'bold', color: '#333' },
  gridSub:      { fontSize: 13, color: '#888', marginTop: 4 },
  gridRed: { backgroundColor: '#fce8e6' },
});