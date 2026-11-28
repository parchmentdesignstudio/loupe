#!/usr/bin/env node
// Publishes a package to its own branch (packages/icons → icons), so any site
// can install it with "github:parchmentdesignstudio/loupe#icons", npm included.
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

// Loupe has one version (pnpm bump), so a package can't go out under another
const versionOf = (file) => JSON.parse(fs.readFileSync(file, 'utf8')).version
const loupe = versionOf('package.json')
if (versionOf(`packages/${name}/package.json`) !== loupe) {
  console.error(`packages/${name} isn't at Loupe's version, ${loupe}. Run pnpm bump ${loupe}, or pnpm bump to a new one.`)
  process.exit(1)
}

// --if-present, as a package of plain source has nothing to build
run(`pnpm --filter ./packages/${name} run --if-present build`)
if (read(`git status --porcelain packages/${name}`)) {
  console.error(`packages/${name} has uncommitted changes after building. Commit them first.`)
  process.exit(1)
}

// The branch drops the package's devDependencies, which only build and test it in Loupe. Some are pnpm's workspace:*,
// which npm won't install from a git branch. It's a commit on top of the split rather than on the branch, as a split
// can only move a branch that's an ancestor of it
const split = read(`git subtree split --prefix packages/${name}`)
const manifest = JSON.parse(read(`git show ${split}:package.json`))
let release = split
if (manifest.devDependencies) {
  delete manifest.devDependencies
  const blob = execSync('git hash-object -w --stdin', { input: `${JSON.stringify(manifest, null, 2)}\n`, encoding: 'utf8' }).trim()
  const index = { ...process.env, GIT_INDEX_FILE: `.git/release-${name}.index` }
  execSync(`git read-tree ${split}`, { env: index })
  execSync(`git update-index --cacheinfo 100644,${blob},package.json`, { env: index })
  const tree = execSync('git write-tree', { env: index, encoding: 'utf8' }).trim()
  fs.rmSync(index.GIT_INDEX_FILE)
  release = execSync(`git commit-tree ${tree} -p ${split} -m "Release ${name}@${loupe} without its devDependencies"`, { encoding: 'utf8' }).trim()
}
run(`git branch -f ${name} ${release}`)
run(`git push origin ${name} --force`)
const tag = `${name}@${loupe}`
if (!read(`git tag -l ${tag}`)) {
  run(`git tag ${tag} ${name}`)
  run(`git push origin ${tag}`)
}
console.log(`Released ${tag} to the ${name} branch`)
