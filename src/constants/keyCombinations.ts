// ブラウザで入力すると本来の機能が実行されるショートカットキー
export const DENY_LIST_OF_KEY_COMBINATION = [
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'q',
  },
  {
    altKey: true,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'ArrowLeft',
  },
  {
    altKey: true,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'ArrowRight',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    key: 'F2',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    key: 'F5',
  },
] as const

export const KEY_COMBINATIONS_ONLY_AVAILABLE_IN_FULL_SCREEN_MODE = [
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'n',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 't',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: false,
    key: 'w',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: 'n',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: 't',
  },
  {
    altKey: false,
    ctrlKey: false,
    metaKey: true,
    shiftKey: true,
    key: 'w',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: false,
    key: 'Tab',
  },
  {
    altKey: false,
    ctrlKey: true,
    metaKey: false,
    shiftKey: true,
    key: 'Tab',
  },
] as const
