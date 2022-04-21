#!/usr/bin/env ts-node

import createShortcuts from './create-shortcuts'

process.argv.slice(2).forEach((path) => {
  createShortcuts(path)
})
