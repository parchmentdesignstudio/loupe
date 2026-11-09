export type Kind = 'phone' | 'tablet' | 'laptop' | 'desktop'
export type Orientation = 'portrait' | 'landscape'
export type Theme = 'light' | 'dark'

export interface Size {
  width: number
  height: number
}

export interface Model {
  id: string
  name: string
  kind: Kind
  /** The screen in points, upright: portrait for phones and tablets, landscape for the rest */
  screen: Size
  /** Pixels to a point, to capture its screen at */
  density: number
  /** Turns between portrait and landscape */
  rotates?: boolean
  /** One of mcknny’s own devices, drawn from its frames */
  mcknny?: boolean
}

// mcknny’s two come first, at the sizes its Mockup and screenshot script
// use, then current devices at their screens’ sizes in points
const list = [
  { id: 'phone', name: 'Phone', kind: 'phone', screen: { width: 404, height: 906 }, density: 3, mcknny: true },
  { id: 'iphone-17-pro', name: 'iPhone 17 Pro', kind: 'phone', screen: { width: 402, height: 874 }, density: 3 },
  { id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', kind: 'phone', screen: { width: 440, height: 956 }, density: 3 },
  { id: 'iphone-air', name: 'iPhone Air', kind: 'phone', screen: { width: 420, height: 912 }, density: 3 },
  { id: 'android', name: 'Android', kind: 'phone', screen: { width: 412, height: 915 }, density: 3 },
  { id: 'ipad-mini', name: 'iPad mini', kind: 'tablet', screen: { width: 744, height: 1133 }, density: 2, rotates: true },
  { id: 'ipad-air-11', name: 'iPad Air 11″', kind: 'tablet', screen: { width: 820, height: 1180 }, density: 2, rotates: true },
  { id: 'ipad-pro-13', name: 'iPad Pro 13″', kind: 'tablet', screen: { width: 1032, height: 1376 }, density: 2, rotates: true },
  { id: 'macbook-air-13', name: 'MacBook Air 13″', kind: 'laptop', screen: { width: 1470, height: 956 }, density: 2 },
  { id: 'macbook-pro-14', name: 'MacBook Pro 14″', kind: 'laptop', screen: { width: 1512, height: 982 }, density: 2 },
  { id: 'macbook-pro-16', name: 'MacBook Pro 16″', kind: 'laptop', screen: { width: 1728, height: 1117 }, density: 2 },
  { id: 'desktop', name: 'Desktop', kind: 'desktop', screen: { width: 1440, height: 868 }, density: 2, mcknny: true },
  { id: 'studio-display', name: 'Studio Display', kind: 'desktop', screen: { width: 2560, height: 1440 }, density: 2 },
] as const satisfies readonly Model[]

export type ModelId = (typeof list)[number]['id']

export const models: readonly Model[] = list

export const kinds: { kind: Kind; name: string }[] = [
  { kind: 'phone', name: 'Phones' },
  { kind: 'tablet', name: 'Tablets' },
  { kind: 'laptop', name: 'Laptops' },
  { kind: 'desktop', name: 'Desktops' },
]

const byId = new Map<string, Model>(models.map((model) => [model.id, model]))

export function modelById(id: string): Model {
  return byId.get(id) ?? models[0]
}

export function upright(model: Model): Orientation {
  return model.kind === 'phone' || model.kind === 'tablet' ? 'portrait' : 'landscape'
}

/** The screen as it sits, turned when a tablet’s on its side */
export function screenSize(model: Model, orientation: Orientation): Size {
  const { width, height } = model.screen
  return model.rotates && orientation !== upright(model) ? { width: height, height: width } : { width, height }
}
