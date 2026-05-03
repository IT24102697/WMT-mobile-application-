import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView
} from 'react-native';
import { useCurrency } from '../context/CurrencyContext';

export default function CurrencyScreen({ navigation }) {
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const handleSave = () => {
    setCurrency(selectedCurrency);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Select Currency</Text>
      </View>
      <Text style={styles.subheader}>Choose your preferred currency. All prices will be updated automatically.</Text>

      <ScrollView style={styles.scrollView}>
        {CURRENCIES.map(c => (
          <TouchableOpacity
            key={c.code}
            style={[
              styles.currencyItem,
              selectedCurrency === c.code && styles.currencyItemActive
            ]}
            onPress={() => setSelectedCurrency(c.code)}
          >
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyFlag}>{c.flag}</Text>
              <View>
                <Text style={styles.currencyCode}>{c.code}</Text>
                <Text style={styles.currencyName}>{c.name}</Text>
              </View>
            </View>
            {selectedCurrency === c.code && (
              <View style={styles.checkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    paddingTop: 20 
  },
  backButton: { marginRight: 16 },
  backButtonText: { fontSize: 16, color: '#FF6B35', fontWeight: 'bold' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subheader: { fontSize: 14, color: '#6b7280', paddingHorizontal: 16, marginBottom: 16 },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  currencyItemActive: {
    borderColor: '#FF6B35',
    backgroundColor: '#fff5f2',
  },
  currencyInfo: { flexDirection: 'row', alignItems: 'center' },
  currencyFlag: { fontSize: 28, marginRight: 16 },
  currencyCode: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  currencyName: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  checkContainer: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  saveBtn: { backgroundColor: '#FF6B35', padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});