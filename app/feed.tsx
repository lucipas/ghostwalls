import { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { currentAnchorPose } from '../src/ar/anchor';
import { fetchNearby, type Ghost } from '../src/api/client';

// MVP feed stub — full heat-map PWA is LUC-169.
export default function FeedScreen() {
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  async function load() {
    const p = await currentAnchorPose();
    setGhosts(await fetchNearby(p.latitude, p.longitude, 2000));
  }
  return (
    <View style={s.c}>
      <Text style={s.h}>Nearby heat 🔥 (MVP list — map PWA in LUC-169)</Text>
      <Button title="Refresh" onPress={load} />
      <FlatList data={ghosts} keyExtractor={(g) => g.id}
        renderItem={({ item }) => <Text style={s.t}>👻 {item.id} · {item.tags.join(' ')} · ⬆ {item.upvotes}</Text>} />
    </View>
  );
}
const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a0f', padding: 16, gap: 10 },
  h: { color: '#fff', fontSize: 20, fontWeight: '700' },
  t: { color: '#ccc', paddingVertical: 4 },
});
