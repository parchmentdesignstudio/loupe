#!/usr/bin/env node
// Sets Loupe's one version, in the root package.json and every package, which
// release then checks. Loupe is versioned as one thing, so the UI and icons
// move together, even when only one of them changed.
//
//   pnpm bump 0.9.0

import fs from 'node:fs'

const version = process.argv[2]
if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
  console.error('Usage: pnpm bump <version>, eg. pnpm bump 0.9.0')
  process.exit(1)
}

const files = ['package.json', ...fs.readdirSync('packages').map((name) => `packages/${name}/package.json`).filter((file) => fs.existsSync(file))]
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  // Just the version line, so the rest of the file keeps its formatting
  fs.writeFileSync(file, text.replace(/("version":\s*)"[^"]*"/, `$1"${version}"`))
}
console.log(`Loupe is now ${version}: ${files.join(', ')}`)
