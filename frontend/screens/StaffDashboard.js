import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function StaffDashboard({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data);
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
          <Text style={styles.greeting}>Staff Portal</Text>
          <Text style={styles.name}>{user?.name} 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Staff Actions</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.gridItem, styles.gridOrange]}
          onPress={() => navigation.navigate('StaffOrders')}
        >
          <Text style={styles.gridIcon}>📋</Text>
          <Text style={styles.gridLabel}>Manage Orders</Text>
          <Text style={styles.gridSub}>View & update status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, styles.gridBlue]}
          onPress={() => navigation.navigate('Inventory')}
        >
          <Text style={styles.gridIcon}>📦</Text>
          <Text style={styles.gridLabel}>Inventory</Text>
          <Text style={styles.gridSub}>Check stock levels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, styles.gridGreen]}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.gridIcon}>🍔</Text>
          <Text style={styles.gridLabel}>View Menu</Text>
          <Text style={styles.gridSub}>Browse all items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.gridItem, styles.gridPurple]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.gridIcon}>👤</Text>
          <Text style={styles.gridLabel}>My Profile</Text>
          <Text style={styles.gridSub}>Edit your details</Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={[styles.gridItem, styles.gridOrange]}
  onPress={() => navigation.navigate('MenuAnalytics')}
>
  <Text style={styles.gridIcon}>📊</Text>
  <Text style={styles.gridLabel}>Analytics</Text>
  <Text style={styles.gridSub}>Menu performance</Text>
</TouchableOpacity>

<TouchableOpacity
  style={[styles.gridItem, styles.gridBlue]}
  onPress={() => navigation.navigate('StockManagement')}
>
  <Text style={styles.gridIcon}>📋</Text>
  <Text style={styles.gridLabel}>Stock Management</Text>
  <Text style={styles.gridSub}>Manage ingredients</Text>
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
                  backgroundColor: '#333' },
  greeting:     { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  name:         { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  logoutBtn:    { padding: 8, paddingHorizontal: 16, borderRadius: 8,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  logoutText:   { color: '#fff', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333',
                  padding: 16, paddingBottom: 12 },
  grid:         { paddingHorizontal: 16, gap: 12 },
  gridItem:     { borderRadius: 12, padding: 20, marginBottom: 4 },
  gridOrange:   { backgroundColor: '#fff3e0' },
  gridBlue:     { backgroundColor: '#e3f2fd' },
  gridGreen:    { backgroundColor: '#e8f5e9' },
  gridPurple:   { backgroundColor: '#f3e5f5' },
  gridIcon:     { fontSize: 32, marginBottom: 8 },
  gridLabel:    { fontSize: 16, fontWeight: 'bold', color: '#333' },
  gridSub:      { fontSize: 13, color: '#888', marginTop: 4 },
});