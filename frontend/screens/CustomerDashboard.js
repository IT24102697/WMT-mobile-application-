import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, StatusBar, ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Theme } from '../theme';

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient-like solid block */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: Theme.spacing.xl, paddingTop: Theme.spacing.xxl,
    paddingBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.primary,
    borderBottomLeftRadius: Theme.borderRadius.xl,
    borderBottomRightRadius: Theme.borderRadius.xl,
    ...Theme.shadows.medium
  },
  greeting: { ...Theme.typography.caption, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  name: { ...Theme.typography.h2, color: '#fff' },
  profileBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center'
  },
  profileBtnText: { fontSize: 24 },
  trustBanner: {
    backgroundColor: Theme.colors.card, margin: Theme.spacing.m,
    marginTop: -Theme.spacing.l, borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    ...Theme.shadows.medium, elevation: 6
  },
  trustLabel: { ...Theme.typography.caption, fontWeight: '600', color: Theme.colors.textLight },
  trustLevel: { ...Theme.typography.body, fontWeight: 'bold', marginTop: Theme.spacing.xs },
  trustScore: { fontSize: 44, fontWeight: 'bold' },
  sectionTitle: { ...Theme.typography.h3, paddingHorizontal: Theme.spacing.m, marginBottom: Theme.spacing.s, marginTop: Theme.spacing.s },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Theme.spacing.s, justifyContent: 'center', gap: Theme.spacing.s },
  gridItem: {
    width: '46%', backgroundColor: Theme.colors.card, borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l, alignItems: 'center', marginBottom: Theme.spacing.xs,
    ...Theme.shadows.small
  },
  gridIcon: { fontSize: 36, marginBottom: Theme.spacing.s },
  gridLabel: { ...Theme.typography.body, fontWeight: '600' },
  orderBtn: {
    margin: Theme.spacing.m, backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.l, borderRadius: Theme.borderRadius.l,
    ...Theme.shadows.medium, alignItems: 'center', marginTop: Theme.spacing.l
  },
  orderBtnText: { ...Theme.typography.button, fontSize: 18 },
});