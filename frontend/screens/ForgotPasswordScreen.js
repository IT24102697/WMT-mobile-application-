import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar
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
        <StatusBar barStyle="dark-content" />
        <View style={styles.successIconContainer}>
          <Text style={styles.successIcon}>📧</Text>
        </View>
        <Text style={styles.successTitle}>Check Your Email!</Text>
        <Text style={styles.successText}>
          We've sent a password reset link to:
        </Text>
        <Text style={styles.emailHighlight}>{email}</Text>
        <Text style={styles.successSub}>
          Click the link in the email to reset your password.
          The link will expire in 1 hour.
        </Text>
        
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.btnText}>Back to Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSent(false)}>
          <Text style={styles.resendLink}>Didn't get the email? Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        <TouchableOpacity style={styles.backBtnContainer} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.icon}>🔐</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. name@example.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Send Reset Link</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Remember your password?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
              Login
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#FFF9F5' }, // Cream background
  inner:            { padding: 24, paddingTop: 60, flexGrow: 1 },
  backBtnContainer: { marginBottom: 32 },
  backBtn:          { color: '#FF6B35', fontSize: 16, fontWeight: '600' },
  header:           { alignItems: 'center', marginBottom: 40 },
  icon:             { fontSize: 64, marginBottom: 16 },
  title:            { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  subtitle:         { fontSize: 16, color: '#666', textAlign: 'center', lineHeight: 24 },
  form:             { backgroundColor: '#fff', padding: 24, borderRadius: 20, 
                      elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, 
                      shadowOpacity: 0.1, shadowRadius: 8 },
  label:            { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  input:            { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#EEE', 
                      borderRadius: 12, padding: 16, marginBottom: 24, fontSize: 16, color: '#333' },
  btn:              { backgroundColor: '#FF6B35', padding: 18, borderRadius: 12, alignItems: 'center' },
  btnDisabled:      { opacity: 0.7 },
  btnText:          { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footer:           { marginTop: 'auto', paddingVertical: 24, alignItems: 'center' },
  footerText:       { color: '#666', fontSize: 15 },
  footerLink:       { color: '#FF6B35', fontWeight: 'bold' },
  
  successContainer: { flex: 1, backgroundColor: '#FFF9F5', padding: 32, justifyContent: 'center', alignItems: 'center' },
  successIconContainer: { width: 120, height: 120, backgroundColor: '#fff', borderRadius: 60, 
                          justifyContent: 'center', alignItems: 'center', marginBottom: 32,
                          elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
                          shadowOpacity: 0.1, shadowRadius: 10 },
  successIcon:      { fontSize: 60 },
  successTitle:     { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  successText:      { fontSize: 16, color: '#666', textAlign: 'center' },
  emailHighlight:   { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 8 },
  successSub:       { fontSize: 15, color: '#888', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  resendLink:       { color: '#FF6B35', fontWeight: '600', marginTop: 24, fontSize: 15 },
});