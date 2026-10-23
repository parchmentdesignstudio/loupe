#!/usr/bin/env node
// Publishes a package to its own branch (packages/icons → icons), so any site
// can install it with "github:stevemckinney/loupe#icons", npm included.
//
//   pnpm release icons

import { execSync } from 'node:child_process'
import fs from 'node:fs'

const name = process.argv[2]
if (!name || !fs.existsSync(`packages/${name}/package.json`)) {
  console.error('Usage: pnpm release <package>, eg. pnpm release icons')
  process.exit(1)
}

const run = (cmd) => execSync(cmd, { stdio: 'inherit' })
const read = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim()

run(`pnpm --filter ./packages/${name} build`)
if (read(`git status --porcelain packages/${name}`)) {
  console.error(`packages/${name} has uncommitted changes after building. Commit them first.`)
  process.exit(1)
}

run(`git subtree split --prefix packages/${name} -b ${name}`)
run(`git push origin ${name} --force`)
const { version } = JSON.parse(fs.readFileSync(`packages/${name}/package.json`, 'utf8'))
const tag = `${name}@${version}`
if (!read(`git tag -l ${tag}`)) {
  run(`git tag ${tag} ${name}`)
  run(`git push origin ${tag}`)
}
console.log(`Released ${tag} to the ${name} branch`)
