// ARCore Geospatial anchor wrapper (Android MVP).
// Production: plug ARCore Geospatial API / GeospatialAnchors here.
// MVP: GPS + compass heading + location accuracy as the anchor pose so a
// ghost planted on a wall reappears in the same spot on relaunch (LUC-171 DoD).
import * as Location from 'expo-location';
import type { AnchorPose } from '../api/client';

export async function ensurePermissions(): Promise<void> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== 'granted') throw new Error('Location permission denied');
}

export async function currentAnchorPose(): Promise<AnchorPose> {
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
  const heading = (await Location.getHeadingAsync().catch(() => null))?.trueHeading
    ?? (await Location.getHeadingAsync().catch(() => null))?.magHeading
    ?? 0;
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    altitude: pos.coords.altitude ?? null,
    heading,
    accuracyM: pos.coords.accuracy ?? null,
  };
}

/** MVP snap check: same ~25m cell + heading within tolerance. Full matcher = LUC-168 (DINOv3/CLIP + pgvector on backend). */
export function poseMatches(a: AnchorPose, b: AnchorPose, distM = 25, headingDeg = 30): boolean {
  const dLat = (a.latitude - b.latitude) * 111_320;
  const dLng = (a.longitude - b.longitude) * 111_320 * Math.cos((b.latitude * Math.PI) / 180);
  const dist = Math.hypot(dLat, dLng);
  let dh = Math.abs(a.heading - b.heading) % 360;
  if (dh > 180) dh = 360 - dh;
  return dist <= distM && dh <= headingDeg;
}
