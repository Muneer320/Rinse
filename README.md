# Rinse

A privacy-first gallery cleaner for Android. Swipe through your photos Tinder-style -- left to delete, right to keep. Clean your gallery by month, track progress, and free up space.

## Features

- **Swipe to clean** -- Left to delete, right to keep. Smooth 60fps animations with haptic feedback.
- **Organized by month** -- Your gallery grouped by month with progress tracking. Clean one month at a time.
- **Session persistence** -- Close the app, reopen, and resume exactly where you left off.
- **Undo window** -- Accidentally deleted a photo? Tap Undo within 5 seconds to restore it.
- **Trash review** -- Deleted photos go to a reviewable trash. Restore or permanently delete with confirmation.
- **Privacy first** -- 100% on-device processing. No photos are ever uploaded. No network requests.
- **Dark premium UI** -- Glassmorphism, smooth animations, satisfying haptics.

## Tech Stack

- **React Native** (via Expo SDK 57)
- **TypeScript**
- **expo-router** for navigation
- **react-native-reanimated** + **react-native-gesture-handler** for 60fps swipe animations
- **expo-media-library** for gallery access and photo deletion
- **expo-image** for fast, cached image loading
- **expo-haptics** for tactile feedback
- **AsyncStorage** for session persistence

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio (for emulator) or a physical Android device

### Installation

```bash
git clone https://github.com/muneer320/Rinse.git
cd Rinse
npm install
```

### Running

```bash
# Start the Expo development server
npx expo start

# Run on Android emulator/device
npx expo start --android
```

### Building APK

```bash
npx eas build --platform android --profile preview
```

## How It Works

1. **Grant photo access** -- Rinse needs read access to your gallery to display photos.
2. **Pick a month** -- Your photos are grouped by month. Tap any month to start cleaning.
3. **Swipe** -- Swipe left to mark a photo for deletion, right to keep it. A 5-second undo window appears after each deletion.
4. **Review trash** -- Deleted photos appear in the Trash tab. Restore or permanently delete them.
5. **Track progress** -- Each month shows a progress ring. Completed months show a checkmark.

## Privacy

Rinse processes everything on your device. No photos are uploaded to any server. The production app makes zero network requests for photo data.

## Project Structure

```
Rinse/
  app/                        # expo-router file-based routing
    _layout.tsx               # Root layout (providers + stack)
    (tabs)/
      _layout.tsx             # Bottom tab navigator
      index.tsx               # Month list screen
      trash.tsx               # Trash screen
    clean/
      [month].tsx             # Swipe cleaning screen
  src/
    components/               # UI components
      SwipeCard.tsx           # Tinder-like swipeable card
      MonthCard.tsx           # Month list item
      ProgressBar.tsx         # Animated progress bar
      PermissionGate.tsx      # Permission request UI
      UndoToast.tsx           # Undo toast notification
      EmptyState.tsx          # Empty state placeholder
      CelebrationOverlay.tsx   # Month completion celebration
    providers/                # React context providers
      GalleryProvider.tsx     # Photo data + permissions
      CleanSessionProvider.tsx # Session state + undo timer
    storage/                  # AsyncStorage persistence
      sessionStorage.ts       # Session state
      trashStorage.ts         # Trash items
      statsStorage.ts         # Aggregate stats
    utils/                    # Types, theme, constants, formatters
```

## License

MIT

## Author

Muneer Alam