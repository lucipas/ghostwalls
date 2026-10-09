import { useEffect, useState } from 'react';
import { View, Text, Button, Image, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { ensurePermissions, currentAnchorPose } from '../src/ar/anchor';
import { plantGhost, requestUploadUrl, uploadAsset, type AnchorPose } from '../src/api/client';

// LUC-171: plant a ghost on a real wall from a phone, preview in AR, reappear on relaunch.
export default function PlantScreen() {
  const [camPerm, requestCam] = useCameraPermissions();
  const [artworkUri, setArtworkUri] = useState<string | null>(null);
  const [pose, setPose] = useState<AnchorPose | null>(null);
  const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { (async () => { await ensurePermissions().catch((e) => setError(String(e))); })(); }, []);

  async function pickArtwork() {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!r.canceled) setArtworkUri(r.assets[0].uri);
  }

  async function capturePose() {
    setError(null);
    try { setPose(await currentAnchorPose()); }
    catch (e) { setError(String(e)); }
  }

  async function publish() {
    if (!artworkUri || !pose) { setError('Need artwork + anchor pose first.'); return; }
    setBusy(true); setError(null); setDone(null);
    try {
      const { uploadId, putUrl } = await requestUploadUrl('image/png');
      await uploadAsset(putUrl, artworkUri);
      const ghost = await plantGhost(pose, uploadId, { tags: tags.split(',').map((t) => t.trim()).filter(Boolean) });
      setDone(`Planted 👻 ${ghost.id} — fades ${ghost.expiresAt}`);
    } catch (e) { setError(String(e)); }
    finally { setBusy(false); }
  }

  if (!camPerm?.granted) {
    return <View style={s.c}><Text style={s.t}>Camera needed for AR preview.</Text><Button title="Grant camera" onPress={requestCam} /></View>;
  }

  return (
    <View style={s.c}>
      <CameraView style={s.cam} facing="back">
        {artworkUri && pose && (
          <View style={s.preview}>
            <Image source={{ uri: artworkUri }} style={s.ghost} />
            <Text style={s.t}>AR preview @ {pose.latitude.toFixed(5)}, {pose.longitude.toFixed(5)} hdg {pose.heading.toFixed(0)}°</Text>
          </View>
        )}
      </CameraView>
      <Button title="1. Pick artwork (photo/sticker/mural png)" onPress={pickArtwork} />
      <Button title="2. Anchor here (ARCore geospatial)" onPress={capturePose} />
      {pose && <Text style={s.t}>Anchored ±{pose.accuracyM?.toFixed(0) ?? '?'}m</Text>}
      <TextInput style={s.input} placeholder="tags, comma,separated" placeholderTextColor="#888" value={tags} onChangeText={setTags} />
      <Button title={busy ? 'Planting…' : '3. Plant ghost → POST /ghosts'} onPress={publish} disabled={busy} />
      {busy && <ActivityIndicator />}
      {done && <Text style={s.ok}>{done}</Text>}
      {error && <Text style={s.err}>{error}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, backgroundColor: '#0a0a0f', padding: 12, gap: 8 },
  t: { color: '#fff' },
  cam: { height: 320, borderRadius: 12, overflow: 'hidden', justifyContent: 'flex-end' },
  preview: { alignItems: 'center', padding: 8, backgroundColor: 'rgba(0,0,0,0.45)' },
  ghost: { width: 160, height: 160, opacity: 0.9 },
  input: { borderWidth: 1, borderColor: '#333', color: '#fff', borderRadius: 8, padding: 10 },
  ok: { color: '#7f7' }, err: { color: '#f77' },
});
