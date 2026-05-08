# Privacy

Rinse requests access to device photos so it can show them by month and ask the operating system to delete photos only after the user confirms. The app does not send photo files or gallery metadata to a server and does not include an analytics SDK. Session progress, IDs of photos marked for deletion, and review counts are saved in local AsyncStorage. Marking a photo for deletion in Rinse does not delete the file from the device gallery. You can restore its Trash entry or permanently delete it with a separate confirmation; Android or iOS may ask for system permission as well.

Uninstalling the app removes its local review and Trash records but does not delete photos from the device gallery. Development in Expo Go and cloud builds through EAS use their own network services to deliver code and builds; those services are separate from gallery photo storage. Do not use personal photos when testing preview builds.

For privacy questions about the project, open an issue in the [Rinse repository](https://github.com/Muneer320/Rinse).
