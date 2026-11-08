// What the tool makes, and the reference list it's checked against.

// Each output drawn on the canvas. `pad` is the share of each side left
// empty, `bg` fills the background colour, `mask` is the overlay shown in
// the preview (it's never baked into the file).
export const OUTPUTS = [
  { id: 'favicon-16', group: 'web', label: 'favicon.ico', note: '16', w: 16, h: 16, pad: 0, bg: false },
  { id: 'favicon-32', group: 'web', label: 'favicon.ico', note: '32', w: 32, h: 32, pad: 0, bg: false },
  { id: 'favicon-48', group: 'web', label: 'favicon.ico', note: '48', w: 48, h: 48, pad: 0, bg: false },
  { id: 'apple-touch', group: 'web', label: 'apple-touch-icon.png', w: 180, h: 180, pad: 0.12, bg: true, lockBg: true, mask: 'ios' },
  { id: 'icon-192', group: 'web', label: 'icon-192.png', w: 192, h: 192, pad: 0, bg: false },
  { id: 'icon-512', group: 'web', label: 'icon-512.png', w: 512, h: 512, pad: 0, bg: false },
  { id: 'maskable', group: 'web', label: 'icon-maskable-512.png', w: 512, h: 512, pad: 0.2, bg: true, lockBg: true, mask: 'maskable' },
  { id: 'og', group: 'social', label: 'og.png', w: 1200, h: 630, pad: 0.3, bg: true, kind: 'og' },
  { id: 'ios-light', group: 'ios', label: 'Light', w: 1024, h: 1024, kind: 'ios', appearance: 'light', mask: 'ios' },
  { id: 'ios-dark', group: 'ios', label: 'Dark', w: 1024, h: 1024, kind: 'ios', appearance: 'dark', mask: 'ios' },
  { id: 'ios-tinted', group: 'ios', label: 'Tinted', w: 1024, h: 1024, kind: 'ios', appearance: 'tinted', mask: 'ios' },
]

export const GROUPS = {
  web: 'Web',
  ios: 'iOS, iPadOS and macOS',
  social: 'Social',
}

// The reference list. `file` ties an item to something the tool exports,
// so the reference page can tick it off.
export const REFERENCE = [
  {
    platform: 'Web',
    items: [
      { name: 'favicon.ico', size: '32 × 32', also: 'Holds 16, 32 and 48', need: 'Required', file: 'favicon.ico', note: 'Browsers and anything that asks for /favicon.ico without reading your HTML.' },
      { name: 'icon.svg', size: 'Vector', need: 'Recommended', file: 'icon.svg', note: 'Sharp at every size in modern browsers. Can switch colours with a prefers-color-scheme media query inside the SVG.' },
      { name: 'apple-touch-icon.png', size: '180 × 180', need: 'Required', file: 'apple-touch-icon.png', note: 'Home screen icon on iPhone and iPad. Must be opaque; iOS rounds the corners itself.' },
      { name: 'icon-192.png', size: '192 × 192', need: 'Required for install', file: 'icon-192.png', note: 'Listed in the web app manifest.' },
      { name: 'icon-512.png', size: '512 × 512', need: 'Required for install', file: 'icon-512.png', note: 'Listed in the web app manifest, also used for splash screens.' },
      { name: 'icon-maskable-512.png', size: '512 × 512', need: 'Recommended', file: 'icon-maskable-512.png', note: 'Android crops it to a circle, squircle or square. Keep the artwork inside the central 80% circle.' },
      { name: 'manifest.webmanifest', size: '', need: 'Required for install', file: 'manifest.webmanifest', note: 'Names the icons, theme colour and background colour.' },
    ],
  },
  {
    platform: 'iOS, iPadOS and macOS',
    items: [
      { name: 'AppIcon.icon', size: '1024 × 1024 canvas', need: 'Required from iOS 26', file: 'AppIcon.icon', note: 'Icon Composer file with up to four layer groups. The system adds the Liquid Glass effect, light, dark, clear and tinted appearances.' },
      { name: 'Light', size: '1024 × 1024', need: 'Fallback', file: 'AppIcon-light.png', note: 'Flat icon for older systems and App Store Connect. Opaque, no rounded corners.' },
      { name: 'Dark', size: '1024 × 1024', need: 'Optional', file: 'AppIcon-dark.png', note: 'Dark appearance for asset catalogue icons before iOS 26.' },
      { name: 'Tinted', size: '1024 × 1024', need: 'Optional', file: 'AppIcon-tinted.png', note: 'Greyscale artwork on black. The system applies the tint colour.' },
      { name: 'macOS artwork', size: '824 × 824 on a 1024 canvas', need: 'Older macOS only', note: 'Before macOS 26, Mac icons drew their own rounded rectangle inside a 100px margin.' },
      { name: 'watchOS', size: '1024 × 1024, circular', need: 'If you ship one', note: 'Comes from the same .icon file, shown as a circle.' },
    ],
  },
  {
    platform: 'Android',
    items: [
      { name: 'Adaptive icon', size: '108 × 108dp', also: '72dp visible, 66dp safe', need: 'Native apps', note: 'Separate foreground and background layers. Export each at 432 × 432px for xxxhdpi.' },
      { name: 'Monochrome layer', size: '108 × 108dp', need: 'Recommended', note: 'For themed icons on Android 13 and later.' },
      { name: 'Play Store icon', size: '512 × 512', need: 'Native apps', note: '32-bit PNG, up to 1MB. Google applies the corner radius and shadow.' },
      { name: 'Play Store feature graphic', size: '1024 × 500', need: 'Native apps', note: 'JPEG or 24-bit PNG, no transparency.' },
    ],
  },
  {
    platform: 'Social',
    items: [
      { name: 'og.png', size: '1200 × 630', also: '1.91:1', need: 'Recommended', file: 'og.png', note: 'Open Graph image used by Facebook, LinkedIn, Slack, iMessage, Discord and others. Keep text away from the edges, as some crop to a square.' },
      { name: 'X large card', size: '1200 × 628', need: 'Optional', note: 'The 1200 × 630 Open Graph image works. Under 5MB.' },
      { name: 'X small card', size: '144 × 144 minimum', need: 'Optional', note: 'Square, used with twitter:card set to summary.' },
      { name: 'og:video', size: '1280 × 720', need: 'Optional', note: 'MP4, H.264. Support varies by platform, and most show the image instead.' },
    ],
  },
]

// The files a zip holds, for the reference page's ticks.
export const STORAGE_KEY = 'loupe-site-icons-generated'
