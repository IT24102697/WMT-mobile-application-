import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, TextInput
} from 'react-native';
import api from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const CATEGORIES = ['ALL','BREAKFAST','LUNCH','DINNER','DRINKS','DESSERTS','SNACKS'];

export default function MenuScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const { formatPrice } = useCurrency();

  useEffect(() => { fetchMenu(); }, []);

  useEffect(() => {
    let result = items;
    if (selectedCategory !== 'ALL') {
      result = result.filter(i => i.category === selectedCategory);
    }
    if (search) {
      result = result.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [selectedCategory, search, items]);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu/available');
      setItems(res.data);
      setFiltered(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c._id === item._id);
    if (existing) {
      setCart(cart.map(c =>
        c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    Alert.alert('Added!', `${item.name} added to cart`);
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.itemCategory}>{item.category}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
        <Text style={styles.addBtnText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🍽️ Our Menu</Text>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search menu items..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Category Filter */}
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catBtn, selectedCategory === item && styles.catBtnActive]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={[styles.catText, selectedCategory === item && styles.catTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Menu Items */}
      <FlatList
        data={filtered}
        keyExtractor={i => i._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>No items found</Text>
        }
      />

      {/* Cart Button */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart', { cart, setCart })}
        >
          <Text style={styles.cartBtnText}>
            🛒 {cart.length} items — {formatPrice(cartTotal)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#f5f5f5' },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:        { fontSize: 24, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  search:        { margin: 16, marginTop: 0, borderWidth: 1, borderColor: '#ddd',
                   borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: '#fff' },
  categoryList:  { paddingHorizontal: 16, marginBottom: 8 },
  catBtn:        { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                   backgroundColor: '#fff', marginRight: 8,
                   borderWidth: 1, borderColor: '#ddd' },
  catBtnActive:  { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catText:       { fontSize: 13, color: '#555' },
  catTextActive: { color: '#fff', fontWeight: 'bold' },
  card:          { backgroundColor: '#fff', borderRadius: 12, padding: 16,
                   marginBottom: 12, flexDirection: 'row',
                   alignItems: 'center', justifyContent: 'space-between' },
  cardLeft:      { flex: 1, marginRight: 12 },
  itemName:      { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemDesc:      { fontSize: 13, color: '#888', marginTop: 4 },
  itemCategory:  { fontSize: 11, color: '#FF6B35', marginTop: 4,
                   textTransform: 'uppercase' },
  itemPrice:     { fontSize: 16, fontWeight: 'bold', color: '#FF6B35', marginTop: 6 },
  addBtn:        { backgroundColor: '#FF6B35', paddingHorizontal: 16,
                   paddingVertical: 10, borderRadius: 8 },
  addBtnText:    { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  empty:         { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16 },
  cartBtn:       { position: 'absolute', bottom: 20, left: 20, right: 20,
                   backgroundColor: '#333', padding: 16, borderRadius: 12 },
  cartBtnText:   { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
});