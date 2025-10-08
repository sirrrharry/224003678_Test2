import React, { useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { CartContext } from '../contexts/CartContext';

export default function CartScreen() {
  const { cart, loading, removeItem, updateQuantity, clearCart } = useContext(CartContext);
  const items = cart?.items ? Object.values(cart.items) : [];

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);

  return (
    <View style={{ flex: 1 }}>
      {loading ? <View style={styles.center}><Text>Loading cart...</Text></View> : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={{ padding: 12 }}
          ListEmptyComponent={() => <Text style={{ textAlign: 'center', marginTop: 20 }}>Your cart is empty</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={{ flex: 1, paddingLeft: 12 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>${(item.price || 0).toFixed(2)}</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, (item.quantity || 0) - 1)} style={styles.qtyBtn}><Text>-</Text></TouchableOpacity>
                  <TextInput value={String(item.quantity || 0)} onChangeText={(txt) => {
                    const n = parseInt(txt) || 0; updateQuantity(item.id, n);
                  }} keyboardType="numeric" style={styles.qtyInput} />
                  <TouchableOpacity onPress={() => updateQuantity(item.id, (item.quantity || 0) + 1)} style={styles.qtyBtn}><Text>+</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.remove}><Text style={{ color: 'red' }}>Remove</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.checkout}><Text style={{ color: '#fff' }}>Checkout</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 12, elevation: 1 },
  image: { width: 80, height: 80, resizeMode: 'contain' },
  title: { fontSize: 14, fontWeight: '600' },
  price: { marginTop: 8, fontWeight: '700' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 },
  qtyInput: { width: 48, height: 36, textAlign: 'center', marginHorizontal: 8, borderWidth: 1, borderColor: '#eee', borderRadius: 4 },
  remove: { marginLeft: 12 },
  footer: { padding: 12, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  total: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  checkout: { backgroundColor: '#0a84ff', padding: 12, borderRadius: 8, alignItems: 'center' }
});
