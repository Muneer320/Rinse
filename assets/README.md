# Rinse artwork

`logo-mark.svg` is the editable, transparent vector source. The standard 1024px icon and 64px favicon place it on `#0D0D0D`. The splash uses the mark on transparency.

Android adaptive foreground and monochrome exports use a 1024px transparent canvas with the artwork scaled to 840px and centered with 92px margins. This keeps the photo and sparkle inside Android's circular safe area when launchers crop or animate the icon. Keep this padding when re-exporting. The adaptive background is solid `#0D0D0D`.
