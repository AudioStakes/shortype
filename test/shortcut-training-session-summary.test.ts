import { beforeEach, describe, expect, test, vi } from 'vitest'

import createShortcutTrainingSessionSummary from '@/models/shortcut-training-session-summary'

vi.mock('@/models/shortcut-catalog', () => {
  const shortcutsByTool = {
    'Google Chrome': [
      {
        id: 'chrome-1',
        category: 'Tabs',
      },
      {
        id: 'chrome-2',
        category: 'Tabs',
      },
    ],
    'Terminal (macOS)': [
      {
        id: 'terminal-1',
        category: 'Shell',
      },
    ],
  }

  return {
    default: {
      tools: () => Object.keys(shortcutsByTool),
      where: ({ tool }: { tool: string }) =>
        (shortcutsByTool[tool as keyof typeof shortcutsByTool] ?? []).map(
          (shortcut) => ({ ...shortcut }),
        ),
      categoriesOf: (tool: string) =>
        Array.from(
          new Set(
            (shortcutsByTool[tool as keyof typeof shortcutsByTool] ?? []).map(
              (shortcut) => shortcut.category,
            ),
          ),
        ),
    },
  }
})

const createSnapshot = () =>
  createShortcutTrainingSessionSummary({
    shortcuts: [
      {
        id: 'chrome-1',
        category: 'Tabs',
      },
      {
        id: 'chrome-2',
        category: 'Tabs',
      },
      {
        id: 'terminal-1',
        category: 'Shell',
      },
    ] as never,
    removedIds: new Set(),
    answeredHistory: new Map([
      ['chrome-1', [true]],
      ['chrome-2', [false]],
    ]),
  })

describe('shortcut-training-session-summary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows mastered rate by tool and category', () => {
    const summary = createSnapshot()

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
