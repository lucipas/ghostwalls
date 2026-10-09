import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={s.c}>
      <Text style={s.h}>👻 Ghost Walls</Text>
      <Text style={s.t}>Ephemeral AR street art — Android MVP. 30-day fade.</Text>
      <Link href="/plant" style={s.l}>＋ Plant a ghost (LUC-171)</Link>
      <Link href="/view" style={s.l}>👁 View ghosts (LUC-168 stub)</Link>
      <Link href="/feed" style={s.l}>🔥 Nearby heat (LUC-169 stub)</Link>
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a0f', padding: 24, gap: 12, justifyContent: 'center' },
  h: { color: '#fff', fontSize: 32, fontWeight: '800' },
  t: { color: '#aaa' },
  l: { color: '#7df', fontSize: 18, paddingVertical: 6 },
});
