import { useState } from 'react';
import { View, Text, Button, FlatList, Image, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { currentAnchorPose, poseMatches } from '../src/ar/anchor';
import { fetchNearby, type Ghost } from '../src/api/client';

// Viewer: nearby ghosts snap onto the right wall (MVP heuristic; backend LUC-168 does embedding match).
export default function ViewScreen() {
  const [camPerm, requestCam] = useCameraPermissions();
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    setError(null);
    try {
      const pose = await currentAnchorPose();
      const all = await fetchNearby(pose.latitude, pose.longitude, 500);
      setGhosts(all.filter((g) => poseMatches(pose, g.anchor)));
    } catch (e) { setError(String(e)); }
  }

  if (!camPerm?.granted) {
    return <View style={s.c}><Text style={s.t}>Camera needed to see ghosts.</Text><Button title="Grant camera" onPress={requestCam} /></View>;
  }

  return (
    <View style={s.c}>
      <CameraView style={s.cam} facing="back">
        <View style={s.overlay}>
          {ghosts.slice(0, 3).map((g) => (
            <Image key={g.id} source={{ uri: g.assetUrl }} style={s.ghost} />
          ))}
          {ghosts.length === 0 && <Text style={s.t}>Point at a wall → Scan</Text>}
        </View>
      </CameraView>
      <Button title="Scan for ghosts" onPress={scan} />
      {error && <Text style={s.err}>{error}</Text>}
      <FlatList data={ghosts} keyExtractor={(g) => g.id}
        renderItem={({ item }) => <Text style={s.t}>👻 {item.id} · ⬆ {item.upvotes} · fades {item.expiresAt}</Text>} />
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a0f', padding: 12, gap: 8 },
  t: { color: '#fff' }, err: { color: '#f77' },
  cam: { height: 340, borderRadius: 12, overflow: 'hidden' },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  ghost: { width: 120, height: 120, opacity: 0.92 },
});
