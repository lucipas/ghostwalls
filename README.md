# 👻 Ghost Walls — Android MVP (Expo)

Ephemeral AR street-art: plant ghosts on real walls, rediscover them in place. 30-day auto-fade.

This repo is the **Expo (React Native) Android MVP**. CI/CD builds; do not build locally.
See Linear project `👻 Ghost Walls` (LUC-166 … LUC-171).

## Scope (MVP = Android only, per LUC-171)

- [x] Geo-anchor planting flow: ARCore geospatial anchor → artwork (photo/sticker/mural) + device pose → `POST /ghosts` → preview in AR → relaunch persistence (LUC-171 / LUC-167)
- [x] Viewer: `GET /ghosts?lat&lng&radius` nearby list + camera overlay (stub for LUC-168 visual matcher)
- [x] Composer stub: photo / sticker / simple mural canvas → asset upload (full WebGPU composer = LUC-170)
- [x] Feed stub: nearby heat list (full map PWA = LUC-169)
- Backend contract (`openapi.yaml`) matches LUC-166: Postgres+PostGIS `ghosts`, R2/S3 assets, Clerk auth, pgvector embeddings.

iOS / full ARCore Geospatial + DINOv3 matcher are post-MVP.

## Dev (no local builds)

```bash
npm install          # deps only
npm start            # expo go (Android device / emulator)
# Do NOT run eas build / gradlew locally — .github/workflows does it.
```

Configure API + auth in `.env`:

```
EXPO_PUBLIC_API_URL=https://api.ghostwalls.example
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

## CI/CD

- `ci.yml` — lint + typecheck (no build artifacts).
- `android-build.yml` — `expo prebuild` → `./gradlew :app:assembleRelease` / EAS `eas build -p android`. Runs only on CI.
