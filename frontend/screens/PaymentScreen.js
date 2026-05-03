import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
  TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const PAYMENT_METHODS = [
  { id: 'CASH',          label: 'Cash',          icon: '💵', desc: 'Pay at counter' },
  { id: 'CARD',          label: 'Card',           icon: '💳', desc: 'Credit/Debit card' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer',  icon: '🏦', desc: 'Direct bank transfer' },
  { id: 'QR',            label: 'QR Payment',     icon: '📱', desc: 'Scan QR to pay' },
];

export default function PaymentScreen({ route, navigation }) {
  const { order } = route.params;
  const [method, setMethod] = useState('CASH');
  const [bankReference, setBankReference] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [validatingCode, setValidatingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrency();

  const TAX_RATE = 0.10;
  const subtotal = order.totalAmount;
  const discountAmount = discount;
  const afterDiscount = subtotal - discountAmount;
  const tax = afterDiscount * TAX_RATE;
  const finalAmount = afterDiscount + tax;

  const validateDiscount = async () => {
    if (!discountCode.trim()) return;
    setValidatingCode(true);
    try {
      const res = await api.post('/trust/discount/validate', {
        code: discountCode,
        orderAmount: subtotal,
      });
      setDiscount(res.data.discountAmount);
      Alert.alert('✅ Discount Applied!',
        `${res.data.discount.percent}% off — Saving ${formatPrice(res.data.discountAmount)}`);
    } catch (err) {
      setDiscount(0);
      Alert.alert('Invalid Code', err.response?.data?.message || 'Discount code not valid');
    } finally {
      setValidatingCode(false);
    }
  };

  const handlePayment = async () => {
    if (method === 'BANK_TRANSFER' && !bankReference.trim()) {
      Alert.alert('Error', 'Please enter bank reference number');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payment/process', {
        orderId: order._id,
        method,
        discountPercent: discount > 0
          ? (discount / subtotal * 100) : 0,
        bankReference: bankReference || null,
      });
      navigation.replace('InvoiceScreen', { invoice: res.data.invoice });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>💳 Payment</Text>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.unitPrice * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Discount Code */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Discount Code</Text>
          <View style={styles.codeRow}>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter discount code"
              value={discountCode}
              onChangeText={setDiscountCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={validateDiscount}
              disabled={validatingCode}
            >
              {validatingCode
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.applyBtnText}>Apply</Text>
              }
            </TouchableOpacity>
          </View>
          {discount > 0 && (
            <Text style={styles.discountApplied}>
              ✅ Discount applied: - {formatPrice(discount)}
            </Text>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billValue}>{formatPrice(subtotal)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Discount</Text>
              <Text style={styles.discountValue}>- {formatPrice(discountAmount)}</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Tax (10%)</Text>
            <Text style={styles.billValue}>{formatPrice(tax)}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatPrice(finalAmount)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodBtn, method === m.id && styles.methodBtnActive]}
              onPress={() => setMethod(m.id)}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel,
                  method === m.id && styles.methodLabelActive]}>
                  {m.label}
                </Text>
                <Text style={styles.methodDesc}>{m.desc}</Text>
              </View>
              <View style={[styles.radio, method === m.id && styles.radioActive]}>
                {method === m.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bank Reference (only for Bank Transfer) */}
        {method === 'BANK_TRANSFER' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bank Transfer Details</Text>
            <View style={styles.bankInfo}>
              <Text style={styles.bankDetail}>Bank: Commercial Bank of Ceylon</Text>
              <Text style={styles.bankDetail}>Account: 1234567890</Text>
              <Text style={styles.bankDetail}>Name: UrbanPlate (Pvt) Ltd</Text>
              <Text style={styles.bankDetail}>
                Amount: {formatPrice(finalAmount)}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter bank reference number *"
              value={bankReference}
              onChangeText={setBankReference}
            />
          </View>
        )}

        {/* QR Payment */}
        {method === 'QR' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>QR Payment</Text>
            <View style={styles.qrBox}>
              <QRCode
                value={JSON.stringify({
                  merchant: 'UrbanPlate',
                  orderId: order._id,
                  amount: finalAmount.toFixed(2),
                  currency: 'LKR',
                  ref: 'TXN' + Date.now(),
                })}
                size={200}
                color="#1a1a2e"
                backgroundColor="#fff"
              />
              <Text style={styles.qrAmount}>{formatPrice(finalAmount)}</Text>
              <Text style={styles.qrText}>Scan this QR code with your banking app</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePayment}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.payBtnText}>
                Pay {formatPrice(finalAmount)}
              </Text>
          }
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#f5f5f5' },
  header:           { fontSize: 24, fontWeight: 'bold', padding: 16 },
  card:             { backgroundColor: '#fff', borderRadius: 12,
                      margin: 16, marginTop: 0, padding: 16, marginBottom: 12 },
  cardTitle:        { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  itemRow:          { flexDirection: 'row', justifyContent: 'space-between',
                      marginBottom: 8 },
  itemName:         { fontSize: 14, color: '#555', flex: 1 },
  itemPrice:        { fontSize: 14, color: '#333', fontWeight: '500' },
  codeRow:          { flexDirection: 'row', gap: 8 },
  codeInput:        { flex: 1, borderWidth: 1, borderColor: '#ddd',
                      borderRadius: 8, padding: 12, fontSize: 15 },
  applyBtn:         { backgroundColor: '#FF6B35', paddingHorizontal: 16,
                      borderRadius: 8, justifyContent: 'center' },
  applyBtnText:     { color: '#fff', fontWeight: 'bold' },
  discountApplied:  { color: '#2e7d32', fontSize: 13, marginTop: 8 },
  billRow:          { flexDirection: 'row', justifyContent: 'space-between',
                      marginBottom: 8 },
  billLabel:        { fontSize: 14, color: '#888' },
  billValue:        { fontSize: 14, color: '#333' },
  discountValue:    { fontSize: 14, color: '#2e7d32', fontWeight: '500' },
  totalRow:         { borderTopWidth: 1, borderTopColor: '#f0f0f0',
                      paddingTop: 12, marginTop: 4 },
  totalLabel:       { fontSize: 16, fontWeight: 'bold' },
  totalAmount:      { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  methodBtn:        { flexDirection: 'row', alignItems: 'center',
                      padding: 14, borderRadius: 10, marginBottom: 8,
                      borderWidth: 1, borderColor: '#eee',
                      backgroundColor: '#f9f9f9' },
  methodBtnActive:  { borderColor: '#FF6B35', backgroundColor: '#fff8f5' },
  methodIcon:       { fontSize: 24, marginRight: 12 },
  methodInfo:       { flex: 1 },
  methodLabel:      { fontSize: 15, fontWeight: '500', color: '#333' },
  methodLabelActive:{ color: '#FF6B35' },
  methodDesc:       { fontSize: 12, color: '#888', marginTop: 2 },
  radio:            { width: 22, height: 22, borderRadius: 11,
                      borderWidth: 2, borderColor: '#ddd',
                      alignItems: 'center', justifyContent: 'center' },
  radioActive:      { borderColor: '#FF6B35' },
  radioDot:         { width: 10, height: 10, borderRadius: 5,
                      backgroundColor: '#FF6B35' },
  bankInfo:         { backgroundColor: '#f5f5f5', borderRadius: 8,
                      padding: 12, marginBottom: 12 },
  bankDetail:       { fontSize: 14, color: '#333', marginBottom: 4 },
  input:            { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                      padding: 12, fontSize: 15 },
  qrBox:            { alignItems: 'center', padding: 24,
                      backgroundColor: '#fff', borderRadius: 12,
                      borderWidth: 1, borderColor: '#eee' },
  qrAmount:         { fontSize: 22, fontWeight: 'bold', color: '#FF6B35',
                      marginTop: 16, marginBottom: 8 },
  qrText:           { fontSize: 13, color: '#888', textAlign: 'center' },
  payBtn:           { margin: 16, backgroundColor: '#FF6B35',
                      padding: 18, borderRadius: 12 },
  payBtnText:       { color: '#fff', textAlign: 'center',
                      fontSize: 18, fontWeight: 'bold' },
});