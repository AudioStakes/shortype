import { describe, expect, test } from 'vitest'
import createShortcutTrainingSessionSummary from '@/models/shortcut-training-session-summary'
import { shortcutFixture } from './shortcut-fixture'

const snapshot = {
  shortcuts: [
    shortcutFixture('chrome-1'),
    shortcutFixture('chrome-2'),
    shortcutFixture('terminal-1'),
  ],
  removedIds: new Set<string>(),
  answeredHistory: new Map([
    ['chrome-1', [true]],
    ['chrome-2', [false]],
  ]),
}

const chromeTool = {
  name: 'Google Chrome',
  shortcuts: [shortcutFixture('chrome-1'), shortcutFixture('chrome-2')],
  categories: [
    {
      name: 'Tabs',
      shortcuts: [shortcutFixture('chrome-1'), shortcutFixture('chrome-2')],
    },
  ],
}
const terminalTool = {
  name: 'Terminal (macOS)',
  shortcuts: [shortcutFixture('terminal-1')],
  categories: [
    {
      name: 'Shell',
      shortcuts: [shortcutFixture('terminal-1')],
    },
  ],
}
const catalog = { tools: [chromeTool, terminalTool] }

describe('shortcut-training-session-summary', () => {
  test('shows mastered rate by tool and category', () => {
    const summary = createShortcutTrainingSessionSummary(snapshot, catalog)

    expect(summary.masteredRateOfEachTool()).toEqual([
      {
        name: 'Google Chrome',
        masteredRate: 50,
      },
      {
        name: 'Terminal (macOS)',
        masteredRate: 0,
      },
    ])

    expect(summary.categoriesWithMasteredRate('Google Chrome')).toEqual([
      {
        name: 'Tabs',
        masteredRate: 50,
      },
    ])
  })

  test('preserves mastery outside the active tool and category selection', () => {
    const summary = createShortcutTrainingSessionSummary(
      {
        ...snapshot,
        shortcuts: [shortcutFixture('chrome-1')],
        answeredHistory: new Map([
          ['chrome-1', [true]],
          ['chrome-2', [true]],
          ['terminal-1', [true]],
        ]),
      },
      {
        tools: [
          {
            ...chromeTool,
            categories: [
              { name: 'Tabs', shortcuts: [shortcutFixture('chrome-1')] },
              { name: 'Other', shortcuts: [shortcutFixture('chrome-2')] },
            ],
          },
          terminalTool,
        ],
      },
    )

    expect(summary.masteredRateOfEachTool()).toEqual([
      { name: 'Google Chrome', masteredRate: 100 },
      { name: 'Terminal (macOS)', masteredRate: 100 },
    ])
    expect(summary.categoriesWithMasteredRate('Google Chrome')).toEqual([
      { name: 'Tabs', masteredRate: 100 },
      { name: 'Other', masteredRate: 100 },
    ])
    expect(summary.countsOfEachStatus()).toEqual({
      mastered: { included: 1, removed: 0 },
      unmastered: { included: 0, removed: 0 },
      unanswered: { included: 0, removed: 0 },
    })
  })
})

test('removed and empty categories have zero mastery and unknown tools have no categories', () => {
  const summary = createShortcutTrainingSessionSummary(
    {
      ...snapshot,
      removedIds: new Set(['chrome-1', 'chrome-2', 'terminal-1']),
    },
    catalog,
  )
  expect(summary.masteredRateOfEachTool()).toEqual([
    { name: 'Google Chrome', masteredRate: 0 },
    { name: 'Terminal (macOS)', masteredRate: 0 },
  ])
  expect(summary.categoriesWithMasteredRate('Google Chrome')).toEqual([
    { name: 'Tabs', masteredRate: 0 },
  ])
  expect(summary.categoriesWithMasteredRate('missing')).toEqual([])
})
