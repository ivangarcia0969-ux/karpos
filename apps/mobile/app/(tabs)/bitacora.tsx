import { View, Text, StyleSheet } from 'react-native';

export default function Bitacora() {
  return (
    <View style={s.root}>
      <Text style={s.h1}>Bitácora Verde</Text>
      <Text style={s.body}>Registra labores rápido — funciona sin señal y se sincroniza al volver a línea.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#FAF7F2' },
  h1: { fontSize: 24, color: '#3B2A1F', fontWeight: '700' },
  body: { marginTop: 8, fontSize: 14, color: '#3B2A1F' },
});
