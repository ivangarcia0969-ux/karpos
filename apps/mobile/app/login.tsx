import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit() {
    if (!email || !password) return Alert.alert('Faltan datos');
    const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
    try {
      const res = await fetch(`${baseUrl}/v1/auth/password`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { accessToken } = await res.json();
      await SecureStore.setItemAsync('karpos.access_token', accessToken);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Error de ingreso', (err as Error).message);
    }
  }

  return (
    <View style={s.root}>
      <Text style={s.h1}>Ingresa</Text>
      <TextInput style={s.input} placeholder="email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={s.input} placeholder="contraseña" secureTextEntry value={password} onChangeText={setPassword} />
      <Pressable style={s.btn} onPress={submit}>
        <Text style={s.btnText}>Continuar</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 24, backgroundColor: '#FAF7F2', justifyContent: 'center' },
  h1: { fontSize: 28, color: '#3B2A1F', fontWeight: '700', marginBottom: 16 },
  input: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#ECECE8' },
  btn: { marginTop: 8, backgroundColor: '#0E5C3A', borderRadius: 8, padding: 14, alignItems: 'center' },
  btnText: { color: '#FAF7F2', fontWeight: '600' },
});
