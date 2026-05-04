import { View, Text, StyleSheet } from 'react-native';

export default function Cosecha() {
  return (
    <View style={s.root}>
      <Text style={s.h1}>Cosecha</Text>
      <Text style={s.body}>Pesa por canasta o por báscula. Las hojas QR de pallet se generan al cerrar el lote.</Text>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#FAF7F2' },
  h1: { fontSize: 24, color: '#3B2A1F', fontWeight: '700' },
  body: { marginTop: 8, fontSize: 14, color: '#3B2A1F' },
});
