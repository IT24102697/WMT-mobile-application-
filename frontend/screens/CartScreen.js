import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, TextInput, ActivityIndicator
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

export default function CartScreen({ route, navigation }) {
  const { cart: initialCart } = route.params;
  const [cart, setCart] = useState(initialCart);
  const [specialRequest, setSpecialRequest] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { formatPrice } = useCurrency();

  const updateQuantity = (id, change) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/orders', {
        items: cart.map(i => ({
          menuItemId: i._id,
          quantity: i.quantity,
        })),
        specialRequest,
        tableNumber,
      });
      Alert.alert(
        'Order Placed! 🎉',
        `Your order #${res.data._id.slice(-6).toUpperCase()} has been placed successfully!`,
        [{ text: 'Pay Now', onPress: () => navigation.navigate('Payment', { order: res.data }) }]
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)} each</Text>
      </View>
      <View style={styles.qtyControl}>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item._id, -1)}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQuantity(item._id, 1)}>
          <Text style={styles.qtyBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => removeItem(item._id)}>
        <Text style={styles.remove}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 Your Cart</Text>

      <FlatList
        data={cart}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Your cart is empty</Text>
        }
      />

      {cart.length > 0 && (
        <View style={styles.bottom}>
          <TextInput
            style={styles.input}
            placeholder="Table Number (optional)"
            value={tableNumber}
            onChangeText={setTableNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Special Request (optional)"
            value={specialRequest}
            onChangeText={setSpecialRequest}
            multiline
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatPrice(total)}</Text>
          </View>
          <TouchableOpacity
            style={styles.orderBtn}
            onPress={handlePlaceOrder}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.orderBtnText}>Place Order</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f5f5f5' },
  header:      { fontSize: 24, fontWeight: 'bold', padding: 16 },
  card:        { backgroundColor: '#fff', borderRadius: 12, padding: 16,
                 marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  cardLeft:    { flex: 1 },
  itemName:    { fontSize: 15, fontWeight: 'bold', color: '#333' },
  itemPrice:   { fontSize: 13, color: '#888', marginTop: 4 },
  qtyControl:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12 },
  qtyBtn:      { width: 32, height: 32, borderRadius: 16,
                 backgroundColor: '#FF6B35', alignItems: 'center', justifyContent: 'center' },
  qtyBtnText:  { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  qty:         { fontSize: 16, fontWeight: 'bold', marginHorizontal: 12 },
  remove:      { fontSize: 20 },
  empty:       { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  bottom:      { backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 20,
                 borderTopRightRadius: 20 },
  input:       { borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
                 padding: 12, marginBottom: 12, fontSize: 15 },
  totalRow:    { flexDirection: 'row', justifyContent: 'space-between',
                 marginBottom: 16 },
  totalLabel:  { fontSize: 18, fontWeight: 'bold' },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: '#FF6B35' },
  orderBtn:    { backgroundColor: '#FF6B35', padding: 16, borderRadius: 12 },
  orderBtnText:{ color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
});