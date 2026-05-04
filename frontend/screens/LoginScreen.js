import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { Theme } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('role', res.data.role);
      await AsyncStorage.setItem('userId', res.data.userId);

      if (res.data.role === 'CUSTOMER') navigation.replace('CustomerDashboard');
      else if (res.data.role === 'STAFF') navigation.replace('StaffDashboard');
      else navigation.replace('AdminDashboard');
    } catch (err) {
      Alert.alert('Error', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logoIcon}>🍽️</Text>
          <Text style={styles.logoText}>UrbanPlate</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. name@example.com"
            placeholderTextColor={Theme.colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={Theme.colors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Login</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.footerLinkContainer}>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footerLinkContainer}>
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkHighlight}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  inner: { flexGrow: 1, padding: Theme.spacing.l, paddingTop: Theme.spacing.xxl * 1.5 },
  header: { alignItems: 'center', marginBottom: Theme.spacing.xl },
  logoIcon: { fontSize: 56, marginBottom: Theme.spacing.s },
  logoText: { ...Theme.typography.h1, marginBottom: Theme.spacing.xs },
  subtitle: { ...Theme.typography.body, color: Theme.colors.textLight },
  card: {
    backgroundColor: Theme.colors.card,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.l,
    ...Theme.shadows.medium,
    marginBottom: Theme.spacing.xl,
  },
  label: { ...Theme.typography.caption, fontWeight: '600', color: Theme.colors.text, marginBottom: Theme.spacing.xs },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.m,
    padding: Theme.spacing.m,
    marginBottom: Theme.spacing.l,
    ...Theme.typography.body,
  },
  btn: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m,
    alignItems: 'center',
    marginTop: Theme.spacing.s,
    ...Theme.shadows.small,
  },
  btnText: { ...Theme.typography.button },
  footer: { alignItems: 'center', marginTop: 'auto', paddingBottom: Theme.spacing.l },
  footerLinkContainer: { paddingVertical: Theme.spacing.s },
  forgotLink: { ...Theme.typography.body, color: Theme.colors.textLight, fontWeight: '500' },
  linkText: { ...Theme.typography.body, color: Theme.colors.textLight },
  linkHighlight: { color: Theme.colors.primary, fontWeight: 'bold' },
});