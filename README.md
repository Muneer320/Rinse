# Rinse

Rinse is an Android focused photo review prototype built with Expo SDK 57. It groups the device photo library by month. Swipe right to keep a photo, or left to mark it for deletion. A marked photo is stored in Rinse's local Trash list and remains in the device gallery until you explicitly confirm permanent deletion. The latest left swipe can be undone for five seconds; older marked photos can be restored from Trash later. Rinse does not upload gallery photos.

## Run

Use Node.js 22.13 or newer and an Android device or emulator with Expo Go. A development build is recommended when checking native media deletion behavior.

```sh
npm ci
npx expo start
```

Open the QR code in Expo Go or press `a` for a running Android emulator. Grant photo library access, choose a month, and review a few test photos. Tap **Trash** to restore a marked photo or confirm permanent deletion. Android may present a separate system consent dialog before deleting media. Use disposable test photos for this demo.

For an installable preview APK, sign in to EAS and run `eas build --platform android --profile preview`. The production profile creates an Android App Bundle for store submission; no store release is claimed here. Build numbers are configured in `app.json` and the production EAS profile increments them.

## Checks

```sh
npm test
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android
```

The tests cover consecutive left swipes, persistent Trash records, session resumption after the first swipe, and Undo on the last photo. A device or emulator is still needed to confirm the native permission and media deletion dialogs.

## Design and scope

Rinse stores session position, Trash IDs and review counters in AsyncStorage on the device. Photo files stay in the system gallery until the user confirms **Delete Forever** or **Empty All**. Empty All sends one batch delete request and keeps Trash records if the request fails. The month list fetches lightweight media metadata first; full photo data is loaded when a month is opened. Access is limited to photos, though the operating system may offer limited library access.

The counters represent review choices, not reclaimed storage. Rinse does not measure file size or show a space saved figure. It does not automatically purge Trash after 30 days; that item in the [original PRD](docs/PRD.md) remains a future idea because silent permanent deletion needs explicit product decisions and native testing. Large libraries still require a complete metadata scan before the month list is shown.

The Android preview is a prototype. No Play Store submission, public privacy policy URL, device performance benchmark, or release APK is claimed unless listed in a verified release. See [Privacy](PRIVACY.md) and [Architecture](docs/Architecture.md).

MIT license; see [LICENSE](LICENSE).
