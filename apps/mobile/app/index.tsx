import { Link } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default function Welcome() {
  return (
    <View style={s.root}>
      <Text style={s.title}>Karpos</Text>
      <Text style={s.tag}>La operación frutícola, en datos.</Text>
      <Link href="/login" asChild>
        <Pressable style={s.cta}>
          <Text style={s.ctaText}>Ingresar</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#FAF7F2' },
  title: { fontSize: 48, color: '#0E5C3A', fontWeight: '700' },
  tag: { fontSize: 16, color: '#3B2A1F', marginTop: 8, textAlign: 'center' },
  cta: { marginTop: 32, backgroundColor: '#0E5C3A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 12 },
  ctaText: { color: '#FAF7F2', fontWeight: '600', fontSize: 16 },
});
