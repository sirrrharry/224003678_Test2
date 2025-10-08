import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootStack from './navigation/RootStack';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootStack />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
