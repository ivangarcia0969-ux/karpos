import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={s.h1}>Hoy en campo</Text>
      <View style={s.card}>
        <Text style={s.cardTitle}>3 labores pendientes</Text>
        <Text style={s.cardBody}>Cuadrilla A en Cuartel Malbec — poda en verde.</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Carencias activas</Text>
        <Text style={s.cardBody}>2 lotes con PHI vigente — no cosechar.</Text>
      </View>
      <View style={s.card}>
        <Text style={s.cardTitle}>Pesajes acumulados</Text>
        <Text style={s.cardBody}>0 kg registrados desde el último sync.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FAF7F2' },
  h1: { fontSize: 24, color: '#3B2A1F', fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#ECECE8' },
  cardTitle: { fontSize: 16, color: '#0E5C3A', fontWeight: '600' },
  cardBody: { marginTop: 4, fontSize: 14, color: '#3B2A1F' },
});
