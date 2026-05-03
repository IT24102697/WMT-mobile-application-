import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data);
      setName(res.data.name);
      setMobile(res.data.mobile || '');
      setAddress(res.data.address || '');
    } catch (err) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name || !name.trim()) {
      Alert.alert('Error', 'Full Name is required');
      return;
    }
    if (mobile && !/^\d{10}$/.test(mobile)) {
      Alert.alert('Error', 'Mobile number must be exactly 10 digits');
      return;
    }
    setSaving(true);
    try {
      await api.put('/users/profile', { name, mobile, address });
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill both password fields');
      return;
    }
    try {
      await api.put('/users/change-password', { currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      {/* Profile Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.emailText}>{user?.email}</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
        />

        <Text style={styles.label}>Mobile</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          placeholder="Mobile Number (10 digits)"
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Address"
        />

        <TouchableOpacity style={styles.btn} onPress={handleUpdateProfile} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Update Profile</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Trust Score (for customers) */}
      {user?.role === 'CUSTOMER' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trust Score</Text>
          <Text style={styles.trustScore}>{user?.trustScore}/100</Text>
          <Text style={styles.trustLabel}>
            {user?.trustScore >= 80 ? '🌟 High Trust' :
             user?.trustScore >= 60 ? '✅ Normal' :
             user?.trustScore >= 40 ? '⚠️ Warning' : '🚫 Restricted'}
          </Text>
        </View>
      )}

      {/* Change Password */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change Password</Text>
        <TextInput
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Current Password"
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New Password"
          secureTextEntry
        />
        <TouchableOpacity style={styles.btnSecondary} onPress={handleChangePassword}>
          <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:       { fontSize: 24, fontWeight: 'bold', padding: 24, paddingBottom: 12 },
  card:         { backgroundColor: '#fff', margin: 16, marginTop: 8,
                  borderRadius: 12, padding: 16 },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  label:        { fontSize: 13, color: '#888', marginBottom: 4 },
  emailText:    { fontSize: 15, color: '#333', marginBottom: 12,
                  backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8 },
  input:        { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                  padding: 12, marginBottom: 12, fontSize: 15 },
  btn:          { backgroundColor: '#FF6B35', padding: 14, borderRadius: 8 },
  btnSecondary: { backgroundColor: '#333', padding: 14, borderRadius: 8 },
  btnText:      { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
  trustScore:   { fontSize: 48, fontWeight: 'bold', color: '#FF6B35', textAlign: 'center' },
  trustLabel:   { fontSize: 16, textAlign: 'center', marginTop: 4, color: '#555' },
  logoutBtn:    { margin: 16, padding: 14, borderRadius: 8,
                  borderWidth: 1, borderColor: '#ff4444' },
  logoutText:   { color: '#ff4444', textAlign: 'center', fontWeight: 'bold', fontSize: 15 },
});