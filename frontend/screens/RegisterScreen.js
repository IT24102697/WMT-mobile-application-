import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import api from '../services/api';

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
        <TextInput style={styles.input} placeholder="Mobile"
          value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
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

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#fff' },
  inner:           { padding: 24, paddingTop: 20 },
  roleContainer:   { flex: 1, backgroundColor: '#fff', padding: 24,
                     justifyContent: 'center' },
  logo:            { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  roleTitle:       { fontSize: 20, fontWeight: 'bold', textAlign: 'center',
                     marginBottom: 32, color: '#333' },
  roleCard:        { flexDirection: 'row', alignItems: 'center',
                     backgroundColor: '#f9f9f9', borderRadius: 16,
                     padding: 20, marginBottom: 16,
                     borderWidth: 1, borderColor: '#eee' },
  roleIcon:        { fontSize: 36, marginRight: 16 },
  roleInfo:        { flex: 1 },
  roleCardTitle:   { fontSize: 18, fontWeight: 'bold', color: '#333' },
  roleCardSub:     { fontSize: 13, color: '#888', marginTop: 4 },
  roleArrow:       { fontSize: 20, color: '#FF6B35', fontWeight: 'bold' },
  header:          { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn:         { color: '#FF6B35', fontSize: 16, marginRight: 12 },
  headerTitle:     { fontSize: 18, fontWeight: 'bold', color: '#333' },
  infoBanner:      { backgroundColor: '#fff3e0', borderRadius: 10,
                     padding: 12, marginBottom: 16 },
  infoBannerText:  { color: '#e65100', fontSize: 13 },
  sectionTitle:    { fontSize: 14, fontWeight: 'bold', color: '#888',
                     marginBottom: 12, marginTop: 8,
                     textTransform: 'uppercase', letterSpacing: 1 },
  input:           { borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
                     padding: 14, marginBottom: 12, fontSize: 15 },
  btn:             { backgroundColor: '#FF6B35', padding: 16,
                     borderRadius: 10, marginBottom: 16, marginTop: 8 },
  btnText:         { color: '#fff', textAlign: 'center',
                     fontSize: 16, fontWeight: 'bold' },
  link:            { textAlign: 'center', color: '#FF6B35', fontSize: 14 },
});