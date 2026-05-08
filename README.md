# Rinse

Rinse is an Android focused photo review prototype built with Expo SDK 57. It groups the device photo library by month. Swipe right to keep a photo, or left to mark it for deletion. A marked photo is stored in Rinse's local Trash list and remains in the device gallery until you explicitly confirm permanent deletion. The latest left swipe can be undone for five seconds or until the next review choice; older marked photos can be restored from Trash later. Rinse does not upload gallery photos.

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

The tests cover consecutive left swipes, persistent Trash records, session resumption after the first swipe and after the gallery changes, and Undo on the last photo. An Android 16 emulator run also verified photo permission, real swipes, process restart, final-photo Undo, completion, Restore, cancelled deletion, single deletion, one batch consent request for two photos, and refreshed gallery counts. It used disposable images. Physical devices and iOS have not been verified.

## Demo screens

Emulator captures using disposable color-card images:

| Review | Trash | Android confirmation |
| --- | --- | --- |
| <img src="docs/screenshots/review.png" width="220" alt="Review a disposable image by swiping or using Mark and Keep"> | <img src="docs/screenshots/trash.png" width="220" alt="Restore or permanently delete marked images from Trash"> | <img src="docs/screenshots/consent.png" width="220" alt="Android asks for consent before deleting two photos together"> |

## Design and scope

Rinse stores reviewed photo IDs, Trash IDs and review counters in AsyncStorage on the device. It uses those IDs when resuming so newly added photos are not skipped. Photo files stay in the system gallery until the user confirms **Delete Forever** or **Empty All**. Empty All sends one batch delete request and keeps Trash records if the request fails. A cancelled system delete is not retried automatically. The month list fetches lightweight media metadata first; full photo data is loaded when a month is opened. Photos without capture dates use their modification dates. Access is limited to photos, though the operating system may offer limited library access.

The counters represent review choices, not reclaimed storage. Rinse does not measure file size or show a space saved figure. It does not automatically purge Trash after 30 days; that item in the [original PRD](docs/PRD.md) remains a future idea because silent permanent deletion needs explicit product decisions and native testing. Large libraries still require a complete metadata scan before the month list is shown.

The Android preview is a prototype. Transitive advisories remain in the Expo 57, Metro and router dependency tree; inspect `npm audit` before distribution. No Play Store submission, public privacy policy URL, device performance benchmark, or release APK is claimed unless listed in a verified release. See [Privacy](PRIVACY.md) and [Architecture](docs/Architecture.md).

MIT license; see [LICENSE](LICENSE).
