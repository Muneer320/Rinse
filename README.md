<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/Rinse-6C63FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==">
    <img alt="Rinse" src="https://img.shields.io/badge/Rinse-6C63FF?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMiAxNWwtNS01IDEuNDEtMS40MUwxMCAxNC4xN2w3LjU5LTcuNTlMMTkgOGwtOSA5eiIvPjwvc3ZnPg==">
  </picture>
</p>

<p align="center">
  <strong>Swipe to clean your gallery. Privacy-first. Beautiful. Fast.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Android-34C759?style=flat-square&logo=android" alt="Platform: Android">
  <img src="https://img.shields.io/badge/framework-React%20Native-61DAFB?style=flat-square&logo=react" alt="Framework: React Native">
  <img src="https://img.shields.io/badge/SDK-Expo%2057-000020?style=flat-square&logo=expo" alt="SDK: Expo 57">
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6?style=flat-square&logo=typescript" alt="Language: TypeScript">
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License: MIT">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome">
</p>

<br>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>🎯 Swipe to Clean</h3>
      <p>Tinder-style card interface. Swipe <strong>left</strong> to delete, <strong>right</strong> to keep. Smooth <strong>60fps</strong> animations powered by Reanimated worklets running on the UI thread.</p>
    </td>
    <td width="50%">
      <h3>📅 Month-Based Organization</h3>
      <p>Gallery photos grouped by month with blurred preview backgrounds. Each month shows a <strong>progress ring</strong> and completion checkmark.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>⏪ Undo Window</h3>
      <p>Accidentally deleted something? A <strong>5-second undo toast</strong> slides up. Tap to restore. No permanent damage.</p>
    </td>
    <td width="50%">
      <h3>🗑️ Trash Review</h3>
      <p>Deleted photos go to a reviewable <strong>Trash</strong>. Restore individual photos or <strong>Delete Forever</strong> with confirmation dialogs.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔒 100% On-Device</h3>
      <p>All photo processing happens <strong>locally</strong> on your device. <strong>Zero network requests.</strong> No photos are ever uploaded. No analytics. No tracking.</p>
    </td>
    <td width="50%">
      <h3>💾 Session Persistence</h3>
      <p>Close the app anytime. Reopen and <strong>resume exactly where you left off</strong>. Progress is saved to AsyncStorage after every swipe.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📳 Haptic Feedback</h3>
      <p>Three-level haptic response: <strong>light tap</strong> on swipe start, <strong>medium thud</strong> at threshold, <strong>sharp feedback</strong> on delete/keep decision.</p>
    </td>
    <td width="50%">
      <h3>🎨 Dark Premium UI</h3>
      <p>Glassmorphism cards, animated progress bars, celebration overlays on month completion. Purple accent (#6C63FF) on near-black (#0D0D0D).</p>
    </td>
  </tr>
</table>

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Framework** | React Native (Expo SDK 57) | Cross-platform mobile development |
| **Language** | TypeScript | Type safety and developer experience |
| **Navigation** | expo-router | File-based routing with deep linking |
| **Animations** | react-native-reanimated + Gesture Handler | 60fps card swipes on UI thread |
| **Gallery** | expo-media-library (class-based API) | Device photo access and deletion |
| **Images** | expo-image | Fast, cached image loading |
| **Haptics** | expo-haptics | Tactile feedback on interactions |
| **Persistence** | AsyncStorage | Session state, trash, and statistics |
| **Icons** | @expo/vector-icons (Ionicons) | Consistent icon set |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Notes |
|:-----|:--------|:------|
| Node.js | ≥ 18 | [Download](https://nodejs.org/) |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Expo Go | Latest | From [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) |
| Android Studio | Latest | For emulator (optional) |

### Installation

```bash
# Clone the repository
git clone https://github.com/Muneer320/Rinse.git
cd Rinse

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npx expo start
```

### Running on Your Device

| Method | Command | Notes |
|:-------|:--------|:------|
| **Expo Go** | Scan QR code from `npx expo start` | Fastest. No build required. |
| **USB Debug** | `npx expo run:android` | Native build. Requires Android SDK. |
| **Cloud Build** | `eas build --platform android --profile preview` | Build APK on Expo servers. |

---

## 📐 Architecture

```
┌─────────────────────────────────────────────┐
│                  App Entry                    │
│              app/_layout.tsx                  │
│     ┌─────────────────────────────────┐      │
│     │        GalleryProvider            │      │
│     │   Permissions • Month Groups     │      │
│     │   Photo Cache • Stats            │      │
│     └──────────────┬──────────────────┘      │
│                    │                          │
│     ┌──────────────┴──────────────────┐      │
│     │     CleanSessionProvider          │      │
│     │   Swipe State • Undo Timer       │      │
│     │   Progress • Persistence         │      │
│     └──────────────┬──────────────────┘      │
│                    │                          │
│     ┌──────────────┴──────────────────┐      │
│     │         expo-router               │      │
│     │   ┌──────┐  ┌──────┐  ┌───────┐ │      │
│     │   │ Home │  │Trash │  │ Clean │ │      │
│     │   │Screen│  │Screen│  │ Screen│ │      │
│     │   └──────┘  └──────┘  └───────┘ │      │
│     └─────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

### Data Flow

```
Device MediaStore
    │
    ▼
expo-media-library (Query pagination, 100 assets/page)
    │
    ▼
GalleryProvider (groups by month, caches metadata)
    │
    ▼
CleanSessionProvider (tracks swipe position per month)
    │
    ▼
SwipeCard (Reanimated worklets on UI thread)
    │
    ├── Swipe Left  → UndoToast (5s) → TrashStorage
    └── Swipe Right → Mark kept → Advance
```

### Key Design Decisions

| Decision | Rationale |
|:---------|:----------|
| **Expo managed workflow** | Faster development. Native MediaLibrary API built-in. No manual Gradle config. |
| **New class-based MediaLibrary API** | `Asset`, `Query`, `AssetField` provide clean TypeScript interfaces. `exeForMetadata()` for lightweight grouping. |
| **Reanimated worklets on UI thread** | Card animations run at 60fps regardless of JS thread load. Critical for swipe UX. |
| **Toast-based undo (no full trash system)** | Simpler architecture. 5-second window matches Gmail/Telegram UX. |
| **Month metadata first, lazy photo loading** | Initial load is instant. Full-res photos load only when a month is selected. |

---

## 📁 Project Structure

```
Rinse/
├── app/                          # expo-router (file-based routing)
│   ├── _layout.tsx               # Root layout (providers + stack)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom tab navigator
│   │   ├── index.tsx             # Month list screen (Home)
│   │   └── trash.tsx             # Trash review screen
│   └── clean/
│       └── [month].tsx           # Swipe cleaning screen
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── SwipeCard.tsx         # Tinder-like swipeable card
│   │   ├── MonthCard.tsx         # Month list item with blurred bg
│   │   ├── ProgressBar.tsx       # Animated progress bar
│   │   ├── PermissionGate.tsx    # Permission request UI
│   │   ├── UndoToast.tsx         # Animated undo notification
│   │   ├── EmptyState.tsx        # Empty state placeholder
│   │   └── CelebrationOverlay.tsx # Month completion animation
│   │
│   ├── providers/                # React Context providers
│   │   ├── GalleryProvider.tsx   # Photos + permissions + months
│   │   └── CleanSessionProvider.tsx # Session state + undo timer
│   │
│   ├── storage/                  # AsyncStorage persistence layer
│   │   ├── sessionStorage.ts     # Session position + swipes
│   │   ├── trashStorage.ts       # Pending deletion items
│   │   └── statsStorage.ts       # Aggregate statistics
│   │
│   └── utils/                    # Shared utilities
│       ├── types.ts              # TypeScript type definitions
│       ├── theme.ts              # Dark theme (colors, spacing, fonts)
│       ├── constants.ts          # Storage keys, thresholds, timeouts
│       └── formatters.ts         # Date, file size, month formatting
│
├── docs/                         # Project documentation
│   ├── PRD.md                    # Product requirements document
│   └── Architecture.md           # Technical architecture spec
│
├── assets/                       # Static assets (icons, splash)
├── app.json                      # Expo configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # You are here
```

---

## 📝 License

MIT © [Muneer Alam](https://github.com/Muneer320)

---

<p align="center">
  <sub>Built with ❤️ using React Native + Expo</sub>
</p>
