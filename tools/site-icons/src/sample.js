// Example artwork so the tool opens showing what it does. A detailed mark
// for large sizes, a simplified one drawn for 16px and two iOS layers.

const GREEN = '#0f3d30'
const PAPER = '#f1efe6'

export const SAMPLES = {
  artwork: [
    {
      name: 'example-mark.svg',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 64 64"><circle cx="32" cy="32" r="32" fill="${GREEN}"/><circle cx="28" cy="28" r="9.5" fill="${PAPER}" opacity=".14"/><circle cx="28" cy="28" r="12" fill="none" stroke="${PAPER}" stroke-width="5"/><path d="M21 26a7.5 7.5 0 0 1 5-5" fill="none" stroke="${PAPER}" stroke-width="2.5" stroke-linecap="round" opacity=".75"/><path d="M37.5 37.5 47 47" stroke="${PAPER}" stroke-width="6" stroke-linecap="round"/></svg>`,
    },
    {
      name: 'example-mark-16.svg',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="${GREEN}"/><circle cx="7" cy="7" r="3.25" fill="none" stroke="${PAPER}" stroke-width="1.5"/><path d="m9.6 9.6 2.4 2.4" stroke="${PAPER}" stroke-width="2" stroke-linecap="round"/></svg>`,
    },
  ],
  layers: [
    {
      name: 'example-lens.svg',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 64 64"><circle cx="29" cy="29" r="9" fill="none" stroke="${PAPER}" stroke-width="4"/><path d="M35.5 35.5 42 42" stroke="${PAPER}" stroke-width="4.5" stroke-linecap="round"/></svg>`,
    },
    {
      name: 'example-disc.svg',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="${GREEN}"/></svg>`,
    },
  ],
}

export function sampleFile({ name, svg }) {
  return new File([svg], name, { type: 'image/svg+xml' })
}
