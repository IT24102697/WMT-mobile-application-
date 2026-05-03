import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity
} from 'react-native';
import { useCurrency } from '../context/CurrencyContext';

export default function InvoiceScreen({ route, navigation }) {
  const { invoice } = route.params;
  const { formatPrice } = useCurrency();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.invoice}>
        {/* Header */}
        <Text style={styles.logo}>🍽️ UrbanPlate</Text>
        <Text style={styles.invoiceTitle}>INVOICE</Text>
        <Text style={styles.orderId}>
          Order #{invoice.orderId.toString().slice(-6).toUpperCase()}
        </Text>
        <Text style={styles.date}>
          {new Date(invoice.paidAt).toLocaleString()}
        </Text>

        <View style={styles.divider} />

        {/* Items */}
        <Text style={styles.sectionTitle}>Items</Text>
        {invoice.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
            <Text style={styles.itemTotal}>
              {formatPrice(item.unitPrice * item.quantity)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Totals */}
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Subtotal</Text>
          <Text style={styles.billValue}>{formatPrice(invoice.subtotal)}</Text>
        </View>
        {invoice.discount > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Discount</Text>
            <Text style={styles.discountValue}>
              - {formatPrice(invoice.discount)}
            </Text>
          </View>
        )}
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Tax (10%)</Text>
          <Text style={styles.billValue}>{formatPrice(invoice.tax)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.billRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalAmount}>
            {formatPrice(invoice.finalAmount)}
          </Text>
        </View>

        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Payment Method</Text>
          <Text style={styles.billValue}>{invoice.method}</Text>
        </View>

        <View style={styles.divider} />

        {/* Thank you */}
        <Text style={styles.thanks}>Thank you for dining with us! 🙏</Text>
        <Text style={styles.tagline}>UrbanPlate — Taste the Difference</Text>
      </View>

      <TouchableOpacity
        style={styles.doneBtn}
        onPress={() => navigation.navigate('Menu')}
      >
        <Text style={styles.doneBtnText}>Back to Menu</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f5f5f5' },
  invoice:      { backgroundColor: '#fff', margin: 16, borderRadius: 16,
                  padding: 24 },
  logo:         { fontSize: 28, textAlign: 'center', marginBottom: 4 },
  invoiceTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center',
                  letterSpacing: 4, color: '#333' },
  orderId:      { fontSize: 14, textAlign: 'center', color: '#888', marginTop: 4 },
  date:         { fontSize: 13, textAlign: 'center', color: '#aaa', marginTop: 2 },
  divider:      { height: 1, backgroundColor: '#f0f0f0', marginVertical: 16 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#888',
                  marginBottom: 8, textTransform: 'uppercase' },
  itemRow:      { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  itemName:     { flex: 1, fontSize: 14, color: '#333' },
  itemQty:      { fontSize: 14, color: '#888', marginHorizontal: 8 },
  itemTotal:    { fontSize: 14, fontWeight: '500', color: '#333' },
  billRow:      { flexDirection: 'row', justifyContent: 'space-between',
                  marginBottom: 8 },
  billLabel:    { fontSize: 14, color: '#888' },
  billValue:    { fontSize: 14, color: '#333' },
  discountValue:{ fontSize: 14, color: '#2e7d32', fontWeight: '500' },
  totalLabel:   { fontSize: 16, fontWeight: 'bold' },
  totalAmount:  { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  thanks:       { fontSize: 16, textAlign: 'center', color: '#333',
                  marginTop: 8, fontWeight: '500' },
  tagline:      { fontSize: 13, textAlign: 'center', color: '#aaa', marginTop: 4 },
  doneBtn:      { margin: 16, backgroundColor: '#FF6B35',
                  padding: 16, borderRadius: 12 },
  doneBtnText:  { color: '#fff', textAlign: 'center',
                  fontSize: 16, fontWeight: 'bold' },
});