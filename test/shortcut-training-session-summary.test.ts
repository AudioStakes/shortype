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

  test('preserves mastery outside the active tool and category selection', () => {
    const summary = createShortcutTrainingSessionSummary(
      {
        ...snapshot,
        shortcuts: [{ id: 'chrome-1' }] as never,
        answeredHistory: new Map([
          ['chrome-1', [true]],
          ['chrome-2', [true]],
          ['terminal-1', [true]],
        ]),
      },
      {
        tools: [
          {
            ...catalog.tools[0],
            categories: [
              { name: 'Tabs', shortcuts: [{ id: 'chrome-1' }] as never },
              { name: 'Other', shortcuts: [{ id: 'chrome-2' }] as never },
            ],
          },
          catalog.tools[1],
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
