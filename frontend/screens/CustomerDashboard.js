import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function CustomerDashboard({ navigation }) {
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

  const trustColor = (score) => {
    if (score >= 80) return '#2e7d32';
    if (score >= 60) return '#1565c0';
    if (score >= 40) return '#e65100';
    return '#c62828';
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
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileBtnText}>👤</Text>
        </TouchableOpacity>
      </View>
      

      {/* Trust Score Banner */}
      <TouchableOpacity
        style={styles.trustBanner}
        onPress={() => navigation.navigate('TrustScore')}
      >
        <View>
          <Text style={styles.trustLabel}>Your Trust Score</Text>
          <Text style={styles.trustLevel}>
            {user?.trustScore >= 80 ? '🌟 High Trust' :
             user?.trustScore >= 60 ? '✅ Normal' :
             user?.trustScore >= 40 ? '⚠️ Warning' : '🚫 Restricted'}
          </Text>
        </View>
        <Text style={[styles.trustScore, { color: trustColor(user?.trustScore) }]}>
          {user?.trustScore}
        </Text>
      </TouchableOpacity>

      {/* Main Actions */}
      <Text style={styles.sectionTitle}>What would you like?</Text>
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('Menu')}
        >
          <Text style={styles.gridIcon}>🍔</Text>
          <Text style={styles.gridLabel}>Order Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.gridIcon}>📋</Text>
          <Text style={styles.gridLabel}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('TrustScore')}
        >
          <Text style={styles.gridIcon}>⭐</Text>
          <Text style={styles.gridLabel}>Trust Score</Text>
        </TouchableOpacity>

        
        <TouchableOpacity
          style={styles.gridItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.gridIcon}>👤</Text>
          <Text style={styles.gridLabel}>My Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
    style={styles.gridItem}
    onPress={() => navigation.navigate('Currency')}
  >
    <Text style={styles.gridIcon}>💱</Text>
    <Text style={styles.gridLabel}>Currency</Text>
  </TouchableOpacity>

  <TouchableOpacity
  style={styles.gridItem}
  onPress={() => navigation.navigate('Refund')}
>
  <Text style={styles.gridIcon}>💰</Text>
  <Text style={styles.gridLabel}>Refunds</Text>
</TouchableOpacity>
      </View>

      {/* Quick Order Button */}
      <TouchableOpacity
        style={styles.orderBtn}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={styles.orderBtnText}>🍽️ Browse Menu & Order</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f5f5f5' },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { flexDirection: 'row', justifyContent: 'space-between',
                    alignItems: 'center', padding: 24, paddingBottom: 16,
                    backgroundColor: '#FF6B35' },
  greeting:       { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  name:           { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  profileBtn:     { width: 44, height: 44, borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    alignItems: 'center', justifyContent: 'center' },
  profileBtnText: { fontSize: 20 },
  trustBanner:    { backgroundColor: '#fff', margin: 16, borderRadius: 12,
                    padding: 16, flexDirection: 'row',
                    justifyContent: 'space-between', alignItems: 'center' },
  trustLabel:     { fontSize: 13, color: '#888' },
  trustLevel:     { fontSize: 16, fontWeight: '500', marginTop: 4 },
  trustScore:     { fontSize: 48, fontWeight: 'bold' },
  sectionTitle:   { fontSize: 16, fontWeight: 'bold', color: '#333',
                    paddingHorizontal: 16, marginBottom: 12 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap',
                    paddingHorizontal: 12, gap: 8 },
  gridItem:       { width: '47%', backgroundColor: '#fff', borderRadius: 12,
                    padding: 20, alignItems: 'center', marginBottom: 4 },
  gridIcon:       { fontSize: 32, marginBottom: 8 },
  gridLabel:      { fontSize: 14, fontWeight: '500', color: '#333' },
  orderBtn:       { margin: 16, backgroundColor: '#FF6B35',
                    padding: 18, borderRadius: 12 },
  orderBtnText:   { color: '#fff', textAlign: 'center',
                    fontSize: 16, fontWeight: 'bold' },
});