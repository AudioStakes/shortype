import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'

const LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE = {
  [ANSWERED_HISTORY_KEY]: {},
  [REMOVED_IDS_KEY]: [],
  [SCHEMA_VERSION_KEY]: -1,
  [SELECTED_CATEGORIES_KEY]: [
    'タブとウィンドウのショートカット',
    'Google Chrome 機能のショートカット',
    'アドレスバーのショートカット',
    'ウェブページのショートカット',
    'マウスのショートカット',
  ],
  [SELECTED_TOOL_KEY]: 'Google Chrome',
} as const

export default LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE
