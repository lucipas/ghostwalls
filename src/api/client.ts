// API client matching LUC-166: POST/GET /ghosts with geo-radius queries.
const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.ghostwalls.example';

export interface AnchorPose {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  heading: number; // degrees, device compass at plant time
  pitch?: number;
  accuracyM?: number | null;
}

export interface Ghost {
  id: string;
  assetUrl: string;
  anchor: AnchorPose;
  expiresAt: string;
  upvotes: number;
  tags: string[];
}

async function authed(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchNearby(lat: number, lng: number, radiusM = 500, token?: string): Promise<Ghost[]> {
  const url = `${BASE}/ghosts?lat=${lat}&lng=${lng}&radius=${radiusM}`;
  const res = await fetch(url, { headers: await authed(token) });
  if (!res.ok) throw new Error(`GET /ghosts ${res.status}`);
  return res.json();
}

export async function plantGhost(
  pose: AnchorPose,
  assetUploadId: string,
  opts: { tags?: string[]; embedding?: number[] } = {},
  token?: string,
): Promise<Ghost> {
  const res = await fetch(`${BASE}/ghosts`, {
    method: 'POST',
    headers: await authed(token),
    body: JSON.stringify({
      anchor: pose,
      assetUploadId,
      tags: opts.tags ?? [],
      embedding: opts.embedding ?? undefined, // pgvector, LUC-168
    }),
  });
  if (!res.ok) throw new Error(`POST /ghosts ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function requestUploadUrl(contentType: string, token?: string): Promise<{ uploadId: string; putUrl: string }> {
  const res = await fetch(`${BASE}/uploads`, {
    method: 'POST',
    headers: await authed(token),
    body: JSON.stringify({ contentType }),
  });
  if (!res.ok) throw new Error(`POST /uploads ${res.status}`);
  return res.json();
}

export async function uploadAsset(putUrl: string, uri: string, contentType = 'image/png'): Promise<void> {
  const blob = await (await fetch(uri)).blob();
  const res = await fetch(putUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
  if (!res.ok) throw new Error(`asset PUT ${res.status}`);
}
