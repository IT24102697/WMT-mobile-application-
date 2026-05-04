import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import api from '../services/api';
import { Theme } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState(null); // 'CUSTOMER' or 'STAFF'

  // Common fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  // Customer specific
  const [address, setAddress] = useState('');

  // Staff specific
  const [jobRole, setJobRole] = useState('');
  const [department, setDepartment] = useState('');

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !name) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    if (mobile && !/^\d{10}$/.test(mobile)) {
      Alert.alert('Error', 'Mobile number must be exactly 10 digits');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (role === 'CUSTOMER') {
        await api.post('/auth/register/customer', {
          username, email, password, name, mobile, address
        });
        Alert.alert(
          '✅ Registration Successful!',
          'Please check your email to verify your account before logging in.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      } else {
        await api.post('/auth/register/staff', {
          username, email, password, name, mobile, jobRole, department
        });
        Alert.alert(
          '✅ Application Submitted!',
          'Please verify your email. Your account will be reviewed by an admin before you can login.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Role selection screen
  if (!role) {
    return (
      <View style={styles.roleContainer}>
        <Text style={styles.logo}>🍽️ UrbanPlate</Text>
        <Text style={styles.roleTitle}>I am registering as...</Text>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => setRole('CUSTOMER')}
        >
          <Text style={styles.roleIcon}>🧑‍💼</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleCardTitle}>Customer</Text>
            <Text style={styles.roleCardSub}>Browse menu, place orders, make payments</Text>
          </View>
          <Text style={styles.roleArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => setRole('STAFF')}
        >
          <Text style={styles.roleIcon}>👨‍🍳</Text>
          <View style={styles.roleInfo}>
            <Text style={styles.roleCardTitle}>Staff Member</Text>
            <Text style={styles.roleCardSub}>Manage orders, inventory (requires admin approval)</Text>
          </View>
          <Text style={styles.roleArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setRole(null)}>
            <Text style={styles.backBtn}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {role === 'CUSTOMER' ? '🧑‍💼 Customer' : '👨‍🍳 Staff'} Registration
          </Text>
        </View>

        {role === 'STAFF' && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              ⚠️ Staff accounts require admin approval before login
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Personal Information</Text>

        <TextInput style={styles.input} placeholder="Full Name *"
          value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Username *"
          value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Email *"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Mobile (10 digits)"
          value={mobile} onChangeText={setMobile} keyboardType="phone-pad"
          maxLength={10} />
        <TextInput style={styles.input} placeholder="Password * (min 6 characters)"
          value={password} onChangeText={setPassword} secureTextEntry />

        {/* Customer specific fields */}
        {role === 'CUSTOMER' && (
          <>
            <Text style={styles.sectionTitle}>Delivery Information</Text>
            <TextInput style={styles.input} placeholder="Address"
              value={address} onChangeText={setAddress} multiline />
          </>
        )}

        {/* Staff specific fields */}
        {role === 'STAFF' && (
          <>
            <Text style={styles.sectionTitle}>Employment Information</Text>
            <TextInput style={styles.input} placeholder="Job Role (e.g. Waiter, Chef)"
              value={jobRole} onChangeText={setJobRole} />
            <TextInput style={styles.input} placeholder="Department (e.g. Kitchen, Service)"
              value={department} onChangeText={setDepartment} />
          </>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>
                {role === 'CUSTOMER' ? 'Create Account' : 'Submit Application'}
              </Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLinkContainer}>
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkHighlight}>Login</Text>
            </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  inner: { padding: Theme.spacing.l, paddingTop: Theme.spacing.xl },
  roleContainer: { flex: 1, backgroundColor: Theme.colors.background, padding: Theme.spacing.l, justifyContent: 'center' },
  logo: { fontSize: 40, textAlign: 'center', marginBottom: Theme.spacing.m },
  roleTitle: { ...Theme.typography.h2, textAlign: 'center', marginBottom: Theme.spacing.xxl },
  roleCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Theme.colors.card, borderRadius: Theme.borderRadius.l,
    padding: Theme.spacing.l, marginBottom: Theme.spacing.m,
    ...Theme.shadows.medium, borderWidth: 0
  },
  roleIcon: { fontSize: 36, marginRight: Theme.spacing.m },
  roleInfo: { flex: 1 },
  roleCardTitle: { ...Theme.typography.h3, marginBottom: Theme.spacing.xs },
  roleCardSub: { ...Theme.typography.caption, color: Theme.colors.textLight },
  roleArrow: { fontSize: 24, color: Theme.colors.primary, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Theme.spacing.xl, marginTop: Theme.spacing.xl },
  backBtn: { color: Theme.colors.primary, fontSize: 16, marginRight: Theme.spacing.m, fontWeight: '600' },
  headerTitle: { ...Theme.typography.h2 },
  infoBanner: { backgroundColor: '#fff3e0', borderRadius: Theme.borderRadius.m, padding: Theme.spacing.m, marginBottom: Theme.spacing.l },
  infoBannerText: { color: '#e65100', fontSize: 13, fontWeight: '500' },
  sectionTitle: { ...Theme.typography.caption, fontWeight: 'bold', color: Theme.colors.textLight, marginBottom: Theme.spacing.s, marginTop: Theme.spacing.s, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: Theme.colors.card, borderWidth: 1, borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.m, padding: Theme.spacing.m, marginBottom: Theme.spacing.m,
    ...Theme.typography.body, ...Theme.shadows.small
  },
  btn: {
    backgroundColor: Theme.colors.primary, padding: Theme.spacing.m,
    borderRadius: Theme.borderRadius.m, marginBottom: Theme.spacing.m, marginTop: Theme.spacing.s,
    ...Theme.shadows.medium, alignItems: 'center'
  },
  btnText: { ...Theme.typography.button },
  link: { textAlign: 'center', color: Theme.colors.primary, fontSize: 14, fontWeight: '600' },
  footerLinkContainer: { paddingVertical: Theme.spacing.s, alignItems: 'center' },
  linkText: { ...Theme.typography.body, color: Theme.colors.textLight },
  linkHighlight: { color: Theme.colors.primary, fontWeight: 'bold' },
});