import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
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
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>🍽️ UrbanPlate</Text>
        <Text style={styles.subtitle}>Welcome back!</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
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
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>

       
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}
            style={{ marginTop: 12 }}>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner:     { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo:      { fontSize: 36, textAlign: 'center', marginBottom: 8 },
  subtitle:  { fontSize: 16, textAlign: 'center', color: '#888', marginBottom: 32 },
  input:     { borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
               padding: 14, marginBottom: 16, fontSize: 16 },
  btn:       { backgroundColor: '#FF6B35', padding: 16, borderRadius: 10, marginBottom: 16 },
  btnText:   { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  link:      { textAlign: 'center', color: '#FF6B35', fontSize: 14 },
  forgotLink: { textAlign: 'center', color: '#888', fontSize: 14 },
});