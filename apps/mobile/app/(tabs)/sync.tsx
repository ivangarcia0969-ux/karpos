import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { syncOnce } from '@/db/sync';

export default function Sync() {
  const [status, setStatus] = useState('idle');
  const [pending, setPending] = useState(0);

  return (
    <View style={s.root}>
      <Text style={s.h1}>Sincronización</Text>
      <Text style={s.body}>{pending} cambios locales pendientes.</Text>
      <Text style={s.body}>Estado: {status}</Text>
      <Pressable
        style={s.btn}
        onPress={async () => {
          setStatus('running');
          try {
            const res = await syncOnce();
            setStatus(`ok · ${res.pulled} entradas pulled, ${res.pushed} pushed`);
            setPending(0);
          } catch (e) {
            setStatus(`error: ${(e as Error).message}`);
          }
        }}
      >
        <Text style={s.btnText}>Sincronizar ahora</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, padding: 16, backgroundColor: '#FAF7F2' },
  h1: { fontSize: 24, color: '#3B2A1F', fontWeight: '700' },
  body: { marginTop: 8, fontSize: 14, color: '#3B2A1F' },
  btn: { marginTop: 24, backgroundColor: '#0E5C3A', borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText: { color: '#FAF7F2', fontWeight: '600' },
});
