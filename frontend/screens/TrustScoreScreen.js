import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Alert
} from 'react-native';
import api from '../services/api';

export default function TrustScoreScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTrustScore(); }, []);

  const fetchTrustScore = async () => {
    try {
      const res = await api.get('/trust/my');
      setData(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load trust score');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Trust Score</Text>

      {/* Score Card */}
      <View style={styles.scoreCard}>
        <Text style={styles.scoreNumber}>{data?.trustScore}</Text>
        <Text style={styles.scoreMax}>/100</Text>
        <Text style={styles.scoreLabel}>{data?.label}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, {
            width: `${data?.trustScore}%`,
            backgroundColor: data?.color
          }]} />
        </View>
      </View>

      {/* Benefits Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Benefits</Text>
        {data?.trustScore >= 80 && (
          <>
            <Text style={styles.benefit}>✅ Priority order processing</Text>
            <Text style={styles.benefit}>✅ Exclusive discounts available</Text>
            <Text style={styles.benefit}>✅ Free delivery on large orders</Text>
          </>
        )}
        {data?.trustScore >= 60 && data?.trustScore < 80 && (
          <>
            <Text style={styles.benefit}>✅ Standard order processing</Text>
            <Text style={styles.benefit}>✅ Regular discounts available</Text>
          </>
        )}
        {data?.trustScore >= 40 && data?.trustScore < 60 && (
          <>
            <Text style={styles.benefit}>⚠️ Limited order processing</Text>
            <Text style={styles.benefitWarn}>❌ Discounts temporarily restricted</Text>
          </>
        )}
        {data?.trustScore < 40 && (
          <>
            <Text style={styles.benefitWarn}>🚫 Account under review</Text>
            <Text style={styles.benefitWarn}>🚫 Orders may be delayed</Text>
          </>
        )}
      </View>

      {/* How to improve */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>How to improve your score</Text>
        <Text style={styles.tip}>✅ Complete your orders without cancelling</Text>
        <Text style={styles.tip}>✅ Pay on time</Text>
        <Text style={styles.tip}>✅ Leave honest reviews</Text>
        <Text style={styles.tip}>❌ Avoid cancelling orders after placing</Text>
      </View>

      {/* History */}
      {data?.history?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent History</Text>
          {data.history.map((h, idx) => (
            <View key={idx} style={styles.historyRow}>
              <Text style={styles.historyReason}>{h.reason}</Text>
              <Text style={[
                styles.historyChange,
                { color: h.change >= 0 ? '#2e7d32' : '#c62828' }
              ]}>
                {h.change >= 0 ? '+' : ''}{h.change}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f5f5' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { fontSize: 24, fontWeight: 'bold', padding: 16 },
  scoreCard:     { backgroundColor: '#fff', margin: 16, marginTop: 0,
                   borderRadius: 16, padding: 24, alignItems: 'center' },
  scoreNumber:   { fontSize: 72, fontWeight: 'bold', color: '#FF6B35' },
  scoreMax:      { fontSize: 20, color: '#888', marginTop: -10 },
  scoreLabel:    { fontSize: 18, fontWeight: '500', marginTop: 8, color: '#333' },
  progressBg:    { width: '100%', height: 12, backgroundColor: '#f0f0f0',
                   borderRadius: 6, marginTop: 16, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 6 },
  card:          { backgroundColor: '#fff', margin: 16, marginTop: 0,
                   borderRadius: 12, padding: 16 },
  cardTitle:     { fontSize: 16, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  benefit:       { fontSize: 14, color: '#2e7d32', marginBottom: 6 },
  benefitWarn:   { fontSize: 14, color: '#c62828', marginBottom: 6 },
  tip:           { fontSize: 14, color: '#555', marginBottom: 6 },
  historyRow:    { flexDirection: 'row', justifyContent: 'space-between',
                   paddingVertical: 8, borderBottomWidth: 1,
                   borderBottomColor: '#f0f0f0' },
  historyReason: { fontSize: 14, color: '#555', flex: 1 },
  historyChange: { fontSize: 14, fontWeight: 'bold' },
});