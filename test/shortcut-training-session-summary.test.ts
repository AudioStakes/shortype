import { describe, expect, test } from 'vitest'

import createShortcutTrainingSessionSummary from '@/models/shortcut-training-session-summary'

const snapshot = {
  shortcuts: [
    {
      id: 'chrome-1',
    },
    {
      id: 'chrome-2',
    },
    {
      id: 'terminal-1',
    },
  ] as never,
  removedIds: new Set<string>(),
  answeredHistory: new Map([
    ['chrome-1', [true]],
    ['chrome-2', [false]],
  ]),
}

const catalog = {
  tools: [
    {
      name: 'Google Chrome',
      shortcuts: [
        {
          id: 'chrome-1',
        },
        {
          id: 'chrome-2',
        },
      ] as never,
      categories: [
        {
          name: 'Tabs',
          shortcuts: [
            {
              id: 'chrome-1',
            },
            {
              id: 'chrome-2',
            },
          ] as never,
        },
      ],
    },
    {
      name: 'Terminal (macOS)',
      shortcuts: [
        {
          id: 'terminal-1',
        },
      ] as never,
      categories: [
        {
          name: 'Shell',
          shortcuts: [
            {
              id: 'terminal-1',
            },
          ] as never,
        },
      ],
    },
  ],
}

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
})
