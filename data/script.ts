#!/usr/bin/env -S node --import tsx

import createShortcuts from './create-shortcuts'

process.argv.slice(2).forEach((path) => {
  createShortcuts(path)
})
