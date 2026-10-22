import LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE from '@/constants/local-storage-key-to-default-value'
import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
  SELECTED_CATEGORIES_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import shortcutCatalog from '@/models/shortcut-catalog'
import LocalStorage from '@/utils/local-storage'

export type GameSessionProgressSnapshot = {
  removedIds: Set<string>
  answeredHistory: Map<string, boolean[]>
}

export type GameSessionStorageSnapshot = GameSessionProgressSnapshot & {
  selectedTool: string
  selectedCategories: string[]
}

type ProgressOperation =
  | { type: 'answer'; id: string; result: boolean }
  | { type: 'remove'; id: string }
  | { type: 'restore' }

type ProgressLocks = {
  request: (
    name: string,
    options: { mode: 'exclusive' },
    callback: () => void,
  ) => Promise<unknown>
}

type ProgressCoordinatorOptions = {
  storage: Pick<typeof LocalStorage, 'getPersisted' | 'set'>
  locks?: ProgressLocks | undefined
  eventTarget?: EventTarget | undefined
  storageArea?: Storage | undefined
}

const applyProgressOperation = (
  progress: GameSessionProgressSnapshot,
  operation: ProgressOperation,
) => {
  if (operation.type === 'answer') {
    const history = progress.answeredHistory.get(operation.id) ?? []
    progress.answeredHistory.set(operation.id, [...history, operation.result])
  } else if (operation.type === 'remove') {
    progress.removedIds.add(operation.id)
  } else {
    progress.removedIds.clear()
  }
}

export const createGameSessionProgressCoordinator = ({
  storage,
  locks,
  eventTarget,
  storageArea,
}: ProgressCoordinatorOptions) => {
  let durable: GameSessionProgressSnapshot = {
    answeredHistory: new Map(),
    removedIds: new Set(),
  }
  const pending: ProgressOperation[] = []
  const listeners = new Set<(progress: GameSessionProgressSnapshot) => void>()
  let memoryOnly = false
  let processing = false

  const readProgress = (): GameSessionProgressSnapshot => ({
    answeredHistory: new Map(
      Object.entries(
        storage.getPersisted(ANSWERED_HISTORY_KEY) as Record<string, boolean[]>,
      ),
    ),
    removedIds: new Set(storage.getPersisted(REMOVED_IDS_KEY) as string[]),
  })

  const projectProgress = () => {
    const progress = structuredClone(durable)
    for (const operation of pending) {
      applyProgressOperation(progress, operation)
    }
    return progress
  }

  const publish = () => {
    const progress = projectProgress()
    for (const listener of listeners) {
      listener(structuredClone(progress))
    }
  }

  const keepInMemory = () => {
    durable = projectProgress()
    pending.length = 0
    memoryOnly = true
    publish()
  }

  const refresh = () => {
    if (!memoryOnly) {
      try {
        durable = readProgress()
      } catch {
        keepInMemory()
        return
      }
    }
    publish()
  }

  const commitNext = () => {
    const operation = pending[0]
    if (memoryOnly || !operation) {
      return
    }
    try {
      durable = readProgress()
      const next = structuredClone(durable)
      applyProgressOperation(next, operation)
      const saved =
        operation.type === 'answer'
          ? storage.set(
              ANSWERED_HISTORY_KEY,
              Object.fromEntries(next.answeredHistory),
            )
          : storage.set(REMOVED_IDS_KEY, [...next.removedIds])
      if (!saved) {
        keepInMemory()
        return
      }
      durable = next
      pending.shift()
      durable = readProgress()
    } catch {
      keepInMemory()
      return
    }
    publish()
  }

  const flush = () => {
    if (processing || memoryOnly || pending.length === 0) {
      return
    }
    processing = true
    let callbackStarted = false
    const commit = () => {
      callbackStarted = true
      commitNext()
    }
    const finish = () => {
      processing = false
      flush()
    }
    const failedLock = () => {
      // A rejected request can still have run its callback; never replay an answer.
      if (!callbackStarted) {
        commit()
      }
      finish()
    }
    if (!locks) {
      commit()
      finish()
      return
    }
    try {
      void locks
        .request('shortype:training-progress', { mode: 'exclusive' }, commit)
        .then(finish, failedLock)
    } catch {
      failedLock()
    }
  }

  const enqueue = (operation: ProgressOperation) => {
    if (memoryOnly) {
      applyProgressOperation(durable, operation)
      publish()
      return
    }
    pending.push(operation)
    refresh()
    flush()
  }

  const onStorage = (event: Event) => {
    if (memoryOnly) {
      return
    }
    const storageEvent = event as StorageEvent
    if (
      (storageEvent.storageArea !== null &&
        storageEvent.storageArea !== storageArea) ||
      (storageEvent.key !== null &&
        ![ANSWERED_HISTORY_KEY, REMOVED_IDS_KEY, SCHEMA_VERSION_KEY].includes(
          storageEvent.key,
        ))
    ) {
      return
    }
    refresh()
  }

  return {
    appendAnswer: (id: string, result: boolean) => {
      enqueue({ type: 'answer', id, result })
    },
    removeShortcut: (id: string) => {
      enqueue({ type: 'remove', id })
    },
    restoreAllShortcuts: () => {
      enqueue({ type: 'restore' })
    },
    getProgress: () => {
      refresh()
      return projectProgress()
    },
    subscribeProgress: (
      listener: (progress: GameSessionProgressSnapshot) => void,
    ) => {
      if (listeners.size === 0) {
        eventTarget?.addEventListener('storage', onStorage)
      }
      listeners.add(listener)
      refresh()
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) {
          eventTarget?.removeEventListener('storage', onStorage)
        }
      }
    },
  }
}

const getStorageArea = () => {
  try {
    return globalThis.localStorage
  } catch {
    return undefined
  }
}

// Keep unsaved progress for this page even when its game view is remounted.
const progressCoordinator = createGameSessionProgressCoordinator({
  storage: LocalStorage,
  locks: globalThis.navigator.locks,
  eventTarget: globalThis.window,
  storageArea: getStorageArea(),
})

export const loadGameSessionStorage = (): GameSessionStorageSnapshot => {
  const storedTool = LocalStorage.get(SELECTED_TOOL_KEY, {
    cleanup: false,
  }) as string
  const selectedTool = shortcutCatalog.listTools().includes(storedTool)
    ? storedTool
    : LOCAL_STORAGE_KEY_TO_DEFAULT_VALUE[SELECTED_TOOL_KEY]
  const availableCategories = new Set(
    shortcutCatalog.listCategoriesOf(selectedTool),
  )
  const storedCategories = LocalStorage.get(SELECTED_CATEGORIES_KEY, {
    cleanup: false,
  }) as string[]

  return {
    selectedTool,
    selectedCategories:
      storedTool === selectedTool
        ? storedCategories.filter((category) =>
            availableCategories.has(category),
          )
        : [],
    ...progressCoordinator.getProgress(),
  }
}

export const createGameSessionStoragePersistence = () => ({
  ...progressCoordinator,
  persistSelectedTool: (tool: string) => {
    LocalStorage.set(SELECTED_TOOL_KEY, tool)
  },
  persistSelectedCategories: (categories: string[]) => {
    LocalStorage.set(SELECTED_CATEGORIES_KEY, categories)
  },
})
