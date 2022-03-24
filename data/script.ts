#!/usr/bin/env ts-node

import createShortcuts from './createShortcuts'

process.argv.slice(2).forEach((path) => {
  createShortcuts(path)
})
