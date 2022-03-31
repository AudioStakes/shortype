export const availableShortcuts = [
  {
    action: '最後のタブに移動する',
    app: 'Google Chrome',
    category: 'タブとウィンドウのショートカット',
    id: '1',
    isAvailable: true,
    keyCombinations: [
      {
        altKey: false,
        ctrlKey: false,
        key: '9',
        metaKey: true,
        shiftKey: false,
      },
    ],
    os: 'macOS',
    shortcut: '⌘+9',
    unavailableReason: null,
  },
  {
    action: 'ウィンドウを最小化する',
    app: 'Google Chrome',
    category: 'タブとウィンドウのショートカット',
    id: '2',
    isAvailable: true,
    keyCombinations: [
      {
        altKey: false,
        ctrlKey: false,
        key: 'm',
        metaKey: true,
        shiftKey: false,
      },
    ],
    os: 'macOS',
    shortcut: '⌘+m',
    unavailableReason: null,
  },
] as const

export const unsupportedShortcuts = [
  {
    action: '新しいウィンドウを開く',
    app: 'Google Chrome',
    category: 'タブとウィンドウのショートカット',
    id: '1',
    isAvailable: false,
    keyCombinations: [
      {
        altKey: false,
        ctrlKey: false,
        key: 'n',
        metaKey: true,
        shiftKey: false,
      },
    ],
    os: 'macOS',
    shortcut: '⌘+n',
    unavailableReason: 'hasDeniedKeyCombination',
  },
  {
    action: '新しいウィンドウをシークレット モードで開く',
    app: 'Google Chrome',
    category: 'タブとウィンドウのショートカット',
    id: '2',
    isAvailable: false,
    keyCombinations: [
      {
        altKey: false,
        ctrlKey: false,
        key: 'n',
        metaKey: true,
        shiftKey: true,
      },
    ],
    os: 'macOS',
    shortcut: '⌘+shift+n',
    unavailableReason: 'hasDeniedKeyCombination',
  },
] as const

export const shortcutWithMultipleKeyCombinations = [
  {
    action: 'キーボード フォーカスのあるタブを左右に移動する',
    app: 'Google Chrome',
    category: 'タブとウィンドウのショートカット',
    id: '16',
    isAvailable: true,
    keyCombinations: [
      {
        altKey: false,
        ctrlKey: false,
        key: 'ArrowRight',
        metaKey: true,
        shiftKey: false,
      },
      {
        altKey: false,
        ctrlKey: false,
        key: 'ArrowLeft',
        metaKey: true,
        shiftKey: false,
      },
    ],
    os: 'macOS',
    shortcut: '⌘+右矢印または ⌘+左矢印',
    unavailableReason: null,
  },
] as const

export const shortcutWithNonKeyActions = [
  {
    action: 'リンクを新しいバックグラウンド タブで開く',
    app: 'Google Chrome',
    category: 'マウスのショートカット',
    id: '67',
    isAvailable: true,
    needsFillInBlankMode: true,
    keyCombinations: [
      {
        altKey: false,
        ctrlKey: false,
        key: null,
        metaKey: true,
        shiftKey: false,
      },
    ],
    os: 'macOS',
    shortcut: '⌘+リンクをクリック',
    unavailableReason: null,
  },
] as const
