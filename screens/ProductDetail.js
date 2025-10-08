import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CartContext } from '../contexts/CartContext';

export default function ProductDetail({ route, navigation }) {
  const { product } = route.params;
  const { addToCart } = useContext(CartContext);

  const handleAdd = async () => {
    try {
      await addToCart(product, 1);
      alert('Added to cart');
      navigation.navigate('Cart');
    } catch (e) {
      if (e && e.message && e.message.toLowerCase().includes('not authenticated')) {
        alert('Please login to add items to your cart');
        navigation.navigate('Login');
        return;
      }
      alert('Failed to add to cart: ' + (e.message || e));
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Add to Cart</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 300, resizeMode: 'contain', backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  price: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  description: { marginTop: 12, lineHeight: 20 },
  button: { backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' }
});
