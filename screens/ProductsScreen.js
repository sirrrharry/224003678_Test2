import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, logout } = useContext(AuthContext);
  const { addToCart, cart } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory && selectedCategory !== 'all' ? `https://fakestoreapi.com/products/category/${encodeURIComponent(selectedCategory)}` : 'https://fakestoreapi.com/products';
      const res = await fetch(url);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('https://fakestoreapi.com/products/categories');
      const data = await res.json();
      setCategories(['all', ...data]);
    } catch (e) {
      console.warn('Failed to load categories', e);
    }
  };

  React.useLayoutEffect(() => {
    const totalCount = cart && cart.items ? Object.values(cart.items).reduce((s, it) => s + (it.quantity || 0), 0) : 0;
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ marginRight: 18 }} onPress={() => navigation.navigate('Cart')}>
            <View>
              <Ionicons name="cart" size={26} color="#0a84ff" />
              {totalCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{totalCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginRight: 12 }} onPress={() => logout()}>
            <Text style={{ color: '#0a84ff' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, cart]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (error) return <View style={styles.center}><Text>{error}</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
          {categories.map((c) => (
            <TouchableOpacity key={c} onPress={() => { setSelectedCategory(c); fetchProducts(); }} style={[styles.catBtn, selectedCategory === c && styles.catBtnActive]}>
              <Text style={[styles.catTxt, selectedCategory === c && styles.catTxtActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* debug panel removed */}
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={{ flex: 1, paddingLeft: 12 }}>
                  <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
                  <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addBtn} onPress={async () => {
              try {
                await addToCart(item, 1);
                alert('Added to cart');
              } catch (e) {
                alert('Failed to add to cart: ' + (e.message || e));
              }
            }}>
              <Text style={{ color: '#fff' }}>Add</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 2 },
  image: { width: 80, height: 80, resizeMode: 'contain' },
  title: { fontSize: 14, fontWeight: '600' },
  price: { marginTop: 8, fontWeight: '700' }
  ,
  catBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#f2f2f2', marginRight: 8 },
  catBtnActive: { backgroundColor: '#0a84ff' },
  catTxt: { textTransform: 'capitalize' },
  catTxtActive: { color: '#fff' }
  ,
  addBtn: { backgroundColor: '#0a84ff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }
  ,
  cartBadge: { position: 'absolute', right: -6, top: -6, backgroundColor: 'red', minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' }
});

