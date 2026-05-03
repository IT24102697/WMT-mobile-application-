import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import api from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>📧</Text>
        <Text style={styles.successTitle}>Check Your Email!</Text>
        <Text style={styles.successText}>
          We sent a password reset link to {email}
        </Text>
        <Text style={styles.successSub}>
          Click the link in the email to reset your password.
          The link expires in 1 hour.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.btnText}>Back to Login</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back to Login</Text>
        </TouchableOpacity>

        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send you a link to reset your password.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Send Reset Link</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#fff' },
  inner:            { padding: 24, paddingTop: 60 },
  backBtn:          { color: '#FF6B35', fontSize: 15, marginBottom: 32 },
  icon:             { fontSize: 56, textAlign: 'center', marginBottom: 16 },
  title:            { fontSize: 26, fontWeight: 'bold', textAlign: 'center',
                      color: '#333', marginBottom: 8 },
  subtitle:         { fontSize: 15, color: '#888', textAlign: 'center',
                      marginBottom: 32, lineHeight: 22 },
  input:            { borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
                      padding: 14, marginBottom: 16, fontSize: 16 },
  btn:              { backgroundColor: '#FF6B35', padding: 16,
                      borderRadius: 10, marginBottom: 16 },
  btnText:          { color: '#fff', textAlign: 'center',
                      fontSize: 16, fontWeight: 'bold' },
  successContainer: { flex: 1, backgroundColor: '#fff', padding: 24,
                      justifyContent: 'center', alignItems: 'center' },
  successIcon:      { fontSize: 72, marginBottom: 24 },
  successTitle:     { fontSize: 24, fontWeight: 'bold', color: '#333',
                      marginBottom: 12 },
  successText:      { fontSize: 16, color: '#333', textAlign: 'center',
                      marginBottom: 8 },
  successSub:       { fontSize: 14, color: '#888', textAlign: 'center',
                      marginBottom: 32, lineHeight: 22 },
});