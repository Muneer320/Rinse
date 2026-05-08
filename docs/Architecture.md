# Architecture — Rinse

## 1. Overview

Rinse is a React Native app built with Expo SDK 57. It uses a simple, layered architecture optimized for on-device photo management with zero network calls.

```
┌─────────────────────────────────────────────────┐
│                    App Layer                     │
│  app/_layout.tsx          → Root layout          │
│  app/(tabs)/_layout.tsx   → Tab navigator         │
│  app/(tabs)/index.tsx     → Months list screen    │
│  app/(tabs)/trash.tsx     → Trash screen          │
│  app/clean/[month].tsx    → Swipe session screen  │
├─────────────────────────────────────────────────┤
│                  Providers Layer                 │
│  GalleryProvider.tsx     → Media access, months   │
│  CleanSessionProvider.tsx → Swipe session logic   │
├─────────────────────────────────────────────────┤
│                  Components Layer                 │
│  SwipeCard.tsx            → Tinder-style card     │
│  MonthCard.tsx            → Month list item       │
│  ProgressBar.tsx          → Session progress      │
│  PermissionGate.tsx       → Permission UI         │
│  UndoToast.tsx            → Undo notification     │
│  EmptyState.tsx           → Empty placeholder     │
│  CelebrationOverlay.tsx   → Completion screen     │
├─────────────────────────────────────────────────┤
│                   Storage Layer                  │
│  sessionStorage.ts        → Session persistence    │
│  trashStorage.ts          → Trash bin             │
│  statsStorage.ts          → App statistics         │
├─────────────────────────────────────────────────┤
│                    Utils Layer                    │
│  types.ts                 → TypeScript interfaces  │
│  theme.ts                 → Colors, spacing, etc. │
│  constants.ts             → Config values         │
│  formatters.ts            → Date/file formatters  │
└─────────────────────────────────────────────────┘
```

## 2. Data Flow

```
User opens app
    │
    ▼
GalleryProvider checks permissions
    │
    ├── Permission not granted → PermissionGate shows request UI
    │
    └── Permission granted
            │
            ▼
        Query expo-media-library for all images
            │
            ▼
        Group photos by month (getMonthKey)
            │
            ▼
        Load session state from AsyncStorage for each month
            │
            ▼
        Render MonthCards with progress info
            │
            ▼
User taps a month → navigate to /clean/[month]
    │
    ▼
CleanSessionProvider starts session
    │
    ├── Loads all PhotoAssets for that month (GalleryProvider.getPhotosForMonth)
    │
    ├── Resumes from saved session if available
    │
    └── Renders SwipeCard stack
            │
            ▼
        User swipes
            │
            ├── Left → swipeLeft → haptic → add to trash (delayed) → advance
            │
            ├── Right → swipeRight → haptic → record keep → advance
            │
            └── Undo → cancel trash timeout → revert index
                    │
                    ▼
                Session complete
                    │
                    ├── markMonthCompleted
                    ├── clearSession
                    └── Show CelebrationOverlay
```

## 3. Key Design Decisions

### 3.1 Class-Based expo-media-library API

The project uses the new class-based API introduced in expo-media-library v57:

```typescript
// Query for metadata
const results = await new Query()
  .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
  .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
  .limit(100)
  .offset(0)
  .exeForMetadata();

// Load individual asset details
const asset = new Asset(assetId);
const uri = await asset.getUri();
const filename = await asset.getFilename();
```

This avoids the deprecated `getAssetsAsync()` function.

### 3.2 Two-Phase Asset Loading

1. **Phase 1 (fast):** Load all asset metadata (id + creationTime) via `exeForMetadata()` — this is lightweight and fast
2. **Phase 2 (lazy):** When entering a month, load full PhotoAsset details (uri, filename, width, height, mediaType) for only that month's assets

### 3.3 Session Persistence

Session state is saved to AsyncStorage after every swipe:

```typescript
interface SessionState {
  monthKey: string;
  currentIndex: number;
  swipes: SwipeAction[];
  startTime: number;
  lastActiveTime: number;
}
```

On return, the session resumes from `currentIndex` with all previous swipes intact.

### 3.4 Trash with Delayed Commit

When a user swipes delete, the asset is NOT immediately moved to trash. Instead:

1. A toast appears with a 5-second undo timer
2. If the timer expires → the asset is added to trash
3. If the user taps "Undo" → the timer is cancelled and the asset stays

This prevents accidental deletes from causing data loss.

### 3.5 Animated Card Stack

The SwipeCard component uses react-native-reanimated + react-native-gesture-handler:

- **Top card:** Full pan gesture, rotation based on drag distance, spring-back if not past threshold
- **Stack cards (behind):** Scale down and offset downward for a 3D stack effect
- **Overlays:** DELETE/KEEP badges appear with interpolated opacity based on drag position
- **Haptics:** Medium impact triggered when crossing the swipe threshold

### 3.6 Storage Keys

```
rinse:v1:session:{monthKey}   → SessionState JSON
rinse:v1:trash                 → TrashItem[] JSON
rinse:v1:stats                 → AppStats JSON
rinse:v1:completed             → string[] of completed month keys
```

The `v1` prefix allows future schema migrations.

## 4. Dependencies

| Package | Purpose |
|---------|---------|
| expo-router | File-based navigation |
| expo-media-library | Photo library access (class-based API) |
| expo-image | Fast, cached image rendering |
| expo-haptics | Tactile feedback on swipes |
| react-native-reanimated | Smooth 60fps card animations |
| react-native-gesture-handler | Pan gesture detection |
| @react-native-async-storage/async-storage | Local persistence |
| react-native-safe-area-context | Safe area insets |

## 5. Performance Considerations

- **Pagination:** Media library queries are paginated (100 per batch) to avoid memory spikes
- **Card rendering:** Maximum 3 cards are rendered in the stack at any time
- **Image caching:** expo-image handles memory-disk caching automatically
- **Month caching:** Full PhotoAsset arrays are cached in a `useRef` Map after first load
- **Swipe animations:** All run on the UI thread via Reanimated worklets

## 6. Privacy Architecture

```
Rinse App (device)
    │
    ├── expo-media-library → System Media Store (read-only queries)
    │
    ├── AsyncStorage → Local device storage only
    │
    └── ❌ No network calls
         ❌ No analytics
         ❌ No cloud sync
         ❌ No telemetry
```

The app has zero outbound network capability. All data processing is 100% on-device.