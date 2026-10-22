import { describe, expect, test, vi } from 'vitest'

import {
  ANSWERED_HISTORY_KEY,
  REMOVED_IDS_KEY,
  SCHEMA_VERSION_KEY,
  SELECTED_TOOL_KEY,
} from '@/constants/local-storage-keys'
import {
  createGameSessionProgressCoordinator,
  type GameSessionProgressSnapshot,
} from '@/stores/game-session-storage'
import {
  createLocalStorageCore,
  type LocalStorageLike,
} from '@/utils/local-storage-core'

const createStorage = () => {
  const values = new Map<string, string>([[SCHEMA_VERSION_KEY, '0']])
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      values.delete(key)
    }),
  }
}

const createLockQueue = () => {
  const queued: {
    callback: () => void
    resolve: () => void
  }[] = []
  const request = vi.fn(
    (_name: string, _options: { mode: 'exclusive' }, callback: () => void) =>
      new Promise<void>((resolve) => {
        queued.push({ callback, resolve })
      }),
  )
  return {
    request,
    release: async () => {
      const next = queued.shift()
      if (!next) {
        throw new Error('No queued lock request')
      }
      next.callback()
      next.resolve()
      await Promise.resolve()
    },
  }
}

const storageEvent = (
  target: EventTarget,
  key: string | null,
  storageArea: Storage | null = null,
) => {
  target.dispatchEvent(
    new StorageEvent('storage', {
      key,
      storageArea,
      newValue: '{"stale":[true]}',
    }),
  )
}

const createClient = (
  native: LocalStorageLike,
  locks?: ReturnType<typeof createLockQueue>,
  eventTarget = new EventTarget(),
) => {
  const storage = createLocalStorageCore(native)
  return createGameSessionProgressCoordinator({ storage, locks, eventTarget })
}

describe('game session progress synchronization', () => {
  test('trims old history while committing each concurrent answer once', async () => {
    const storage = createStorage()
    storage.setItem(ANSWERED_HISTORY_KEY, '{"id":[false,true,false,true]}')
    const locks = createLockQueue()
    const a = createClient(storage, locks)
    const b = createClient(storage, locks)
    storage.setItem.mockClear()

    expect(a.getProgress().answeredHistory.get('id')).toEqual([false, true])
    a.appendAnswer('id', false)
    b.appendAnswer('id', true)
    expect(a.getProgress().answeredHistory.get('id')).toEqual([true, false])
    await locks.release()
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBe('{"id":[true,false]}')
    expect(b.getProgress().answeredHistory.get('id')).toEqual([false, true])
    await locks.release()

    expect(a.getProgress().answeredHistory.get('id')).toEqual([false, true])
    expect(b.getProgress()).toEqual(a.getProgress())
    expect(
      storage.setItem.mock.calls.filter(
        ([key]) => key === ANSWERED_HISTORY_KEY,
      ),
    ).toEqual([
      [ANSWERED_HISTORY_KEY, '{"id":[true,false]}'],
      [ANSWERED_HISTORY_KEY, '{"id":[false,true]}'],
    ])
  })

  test.each([
    ['same', 'same'],
    ['first', 'second'],
  ])('serializes answers from two clients without losing or deduplicating results: %s, %s', async (first, second) => {
    const storage = createStorage()
    const locks = createLockQueue()
    const a = createClient(storage, locks)
    const b = createClient(storage, locks)
    a.appendAnswer(first, true)
    b.appendAnswer(second, true)
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBeNull()
    expect(a.getProgress().answeredHistory.get(first)).toEqual([true])
    await locks.release()
    await locks.release()
    expect(a.getProgress().answeredHistory).toEqual(
      first === second
        ? new Map([[first, [true, true]]])
        : new Map([
            [first, [true]],
            [second, [true]],
          ]),
    )
    expect(b.getProgress()).toEqual(a.getProgress())
    expect(locks.request).toHaveBeenCalledWith(
      'shortype:training-progress',
      { mode: 'exclusive' },
      expect.any(Function),
    )
  })

  test('retains pending local answers while refreshing remote progress and draining its FIFO', async () => {
    const storage = createStorage()
    const locks = createLockQueue()
    const target = new EventTarget()
    const local = createClient(storage, locks, target)
    const remote = createClient(storage, locks)
    const snapshots = vi.fn<(progress: GameSessionProgressSnapshot) => void>()
    local.subscribeProgress(snapshots)
    remote.appendAnswer('id', false)
    local.appendAnswer('id', true)
    local.appendAnswer('id', true)
    await locks.release()
    storageEvent(target, ANSWERED_HISTORY_KEY)
    expect(snapshots.mock.lastCall?.[0].answeredHistory.get('id')).toEqual([
      true,
      true,
    ])
    await locks.release()
    expect(local.getProgress().answeredHistory.get('id')).toEqual([true, true])
    await locks.release()
    expect(JSON.parse(storage.getItem(ANSWERED_HISTORY_KEY) ?? '{}')).toEqual({
      id: [true, true],
    })
  })

  test('combines exclusions and applies restore/remove operations in commit order', async () => {
    const storage = createStorage()
    const locks = createLockQueue()
    const a = createClient(storage, locks)
    const b = createClient(storage, locks)
    a.removeShortcut('first')
    b.removeShortcut('second')
    await locks.release()
    await locks.release()
    expect(a.getProgress().removedIds).toEqual(new Set(['first', 'second']))
    a.removeShortcut('third')
    b.restoreAllShortcuts()
    await locks.release()
    await locks.release()
    expect(a.getProgress().removedIds).toEqual(new Set())
    a.restoreAllShortcuts()
    b.removeShortcut('last')
    await locks.release()
    await locks.release()
    expect(a.getProgress().removedIds).toEqual(new Set(['last']))
  })

  test('refreshes current storage on delayed events, removals, schema changes and clear', () => {
    const storage = createStorage()
    const target = new EventTarget()
    const client = createClient(storage, undefined, target)
    const snapshots = vi.fn<(progress: GameSessionProgressSnapshot) => void>()
    const unsubscribe = client.subscribeProgress(snapshots)
    storage.setItem(ANSWERED_HISTORY_KEY, '{"newest":[false]}')
    storageEvent(target, ANSWERED_HISTORY_KEY)
    expect(snapshots.mock.lastCall?.[0].answeredHistory).toEqual(
      new Map([['newest', [false]]]),
    )
    storage.removeItem(ANSWERED_HISTORY_KEY)
    storageEvent(target, ANSWERED_HISTORY_KEY)
    expect(snapshots.mock.lastCall?.[0].answeredHistory).toEqual(new Map())
    storage.setItem(REMOVED_IDS_KEY, '["id"]')
    storageEvent(target, REMOVED_IDS_KEY)
    expect(snapshots.mock.lastCall?.[0].removedIds).toEqual(new Set(['id']))
    storage.setItem(SCHEMA_VERSION_KEY, '1')
    storageEvent(target, SCHEMA_VERSION_KEY)
    expect(snapshots.mock.lastCall?.[0].removedIds).toEqual(new Set())
    storage.setItem(SCHEMA_VERSION_KEY, '0')
    storageEvent(target, null)
    expect(snapshots.mock.lastCall?.[0].removedIds).toEqual(new Set(['id']))
    storage.removeItem(REMOVED_IDS_KEY)
    storage.removeItem(SCHEMA_VERSION_KEY)
    storageEvent(target, null)
    expect(snapshots.mock.lastCall?.[0].removedIds).toEqual(new Set())
    unsubscribe()
    const calls = snapshots.mock.calls.length
    storageEvent(target, ANSWERED_HISTORY_KEY)
    expect(snapshots).toHaveBeenCalledTimes(calls)
  })

  test('subscribes before its initial refresh and ignores unrelated or session storage events', () => {
    const storage = createStorage()
    const target = new EventTarget()
    const add = vi.spyOn(target, 'addEventListener')
    const client = createClient(storage, undefined, target)
    const snapshots = vi.fn(() => {
      expect(add).toHaveBeenCalledWith('storage', expect.any(Function))
    })
    const remove = vi.spyOn(target, 'removeEventListener')
    const unsubscribe = client.subscribeProgress(snapshots)
    storage.setItem(ANSWERED_HISTORY_KEY, '{"remote":[true]}')
    storageEvent(target, SELECTED_TOOL_KEY)
    storageEvent(target, ANSWERED_HISTORY_KEY, sessionStorage)
    expect(snapshots).toHaveBeenCalledTimes(1)
    storageEvent(target, ANSWERED_HISTORY_KEY)
    expect(snapshots).toHaveBeenCalledTimes(2)
    unsubscribe()
    expect(remove).toHaveBeenCalledWith('storage', expect.any(Function))
  })

  test('isolates returned snapshots and each subscriber from mutable collections', () => {
    const storage = createStorage()
    const client = createClient(storage)
    client.appendAnswer('id', true)
    client.removeShortcut('id')
    client.subscribeProgress((snapshot) => {
      snapshot.answeredHistory.get('id')?.push(false)
      snapshot.removedIds.clear()
    })
    const snapshots = vi.fn<(progress: GameSessionProgressSnapshot) => void>()
    client.subscribeProgress(snapshots)
    const returned = client.getProgress()
    returned.answeredHistory.clear()
    returned.removedIds.add('other')
    expect(client.getProgress()).toEqual({
      answeredHistory: new Map([['id', [true]]]),
      removedIds: new Set(['id']),
    })
    expect(snapshots.mock.lastCall?.[0]).toEqual(client.getProgress())
  })

  test('retains every projected operation after a failed write, ignores events and survives resubscription', async () => {
    const native = createStorage()
    native.setItem(ANSWERED_HISTORY_KEY, '{"old":[false]}')
    const writes = vi.fn(() => {
      throw new Error('Quota exceeded')
    })
    const storage = { ...native, setItem: writes }
    const locks = createLockQueue()
    const target = new EventTarget()
    const client = createClient(storage, locks, target)
    const firstMount = vi.fn<(progress: GameSessionProgressSnapshot) => void>()
    const unsubscribe = client.subscribeProgress(firstMount)
    client.appendAnswer('id', true)
    client.appendAnswer('id', false)
    client.removeShortcut('id')
    await locks.release()
    const reads = native.getItem.mock.calls.length
    const notifications = firstMount.mock.calls.length
    native.setItem(ANSWERED_HISTORY_KEY, '{"remote":[true]}')
    storageEvent(target, ANSWERED_HISTORY_KEY)
    expect(firstMount.mock.lastCall?.[0]).toEqual({
      answeredHistory: new Map([
        ['old', [false]],
        ['id', [true, false]],
      ]),
      removedIds: new Set(['id']),
    })
    expect(firstMount).toHaveBeenCalledTimes(notifications)
    expect(native.getItem).toHaveBeenCalledTimes(reads)
    unsubscribe()
    const attempts = writes.mock.calls.length
    client.appendAnswer('id', true)
    client.restoreAllShortcuts()
    client.removeShortcut('other')
    const secondMount = vi.fn<(progress: GameSessionProgressSnapshot) => void>()
    client.subscribeProgress(secondMount)
    expect(secondMount.mock.lastCall?.[0]).toEqual({
      answeredHistory: new Map([
        ['old', [false]],
        ['id', [false, true]],
      ]),
      removedIds: new Set(['other']),
    })
    expect(writes).toHaveBeenCalledTimes(attempts)
    expect(locks.request).toHaveBeenCalledTimes(1)
  })

  test('preserves known progress when a read fails and continues locally without retrying', () => {
    const native = createStorage()
    const client = createClient(native)
    client.appendAnswer('known', true)
    native.getItem.mockImplementation(() => {
      throw new Error('Read failed')
    })
    client.appendAnswer('local', false)
    const readAttempts = native.getItem.mock.calls.length
    const writeAttempts = native.setItem.mock.calls.length
    client.removeShortcut('local')
    expect(client.getProgress()).toEqual({
      answeredHistory: new Map([
        ['known', [true]],
        ['local', [false]],
      ]),
      removedIds: new Set(['local']),
    })
    expect(native.getItem).toHaveBeenCalledTimes(readAttempts)
    expect(native.setItem).toHaveBeenCalledTimes(writeAttempts)
  })

  test('falls back synchronously when locks are unavailable or throw before their callback', () => {
    const storage = createStorage()
    const unlocked = createClient(storage)
    unlocked.appendAnswer('id', true)
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBe('{"id":[true]}')
    const rejected = createGameSessionProgressCoordinator({
      storage: createLocalStorageCore(storage),
      locks: {
        request: () => {
          throw new Error('Locks disabled')
        },
      },
    })
    rejected.appendAnswer('id', false)
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBe('{"id":[true,false]}')
  })

  test('uses the same commit when a lock rejects before its callback', async () => {
    const storage = createStorage()
    const client = createGameSessionProgressCoordinator({
      storage: createLocalStorageCore(storage),
      locks: { request: () => Promise.reject(new Error('Locks disabled')) },
    })
    client.appendAnswer('id', true)
    await Promise.resolve()
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBe('{"id":[true]}')
  })

  test('never replays a lock callback that already committed before rejection', async () => {
    const storage = createStorage()
    const client = createGameSessionProgressCoordinator({
      storage: createLocalStorageCore(storage),
      locks: {
        request: (_name, _options, callback) => {
          callback()
          return Promise.reject(new Error('Rejected after callback'))
        },
      },
    })
    client.appendAnswer('id', true)
    await Promise.resolve()
    expect(storage.getItem(ANSWERED_HISTORY_KEY)).toBe('{"id":[true]}')
    expect(storage.setItem).toHaveBeenCalledTimes(2)
  })
})

test('keeps all waiting deltas if a read fails while acquiring the lock', async () => {
  const native = createStorage()
  native.setItem(ANSWERED_HISTORY_KEY, '{"known":[false]}')
  const locks = createLockQueue()
  const client = createClient(native, locks)
  client.appendAnswer('waiting', true)
  client.appendAnswer('waiting', false)
  native.getItem.mockImplementation(() => {
    throw new Error('Read failed')
  })
  await locks.release()
  expect(client.getProgress()).toEqual({
    answeredHistory: new Map([
      ['known', [false]],
      ['waiting', [true, false]],
    ]),
    removedIds: new Set(),
  })
  expect(native.setItem).toHaveBeenCalledTimes(1)
  expect(locks.request).toHaveBeenCalledTimes(1)
})

test('does not replay a queued callback after an external refresh fails', async () => {
  const native = createStorage()
  const locks = createLockQueue()
  const target = new EventTarget()
  const client = createClient(native, locks, target)
  client.subscribeProgress(() => undefined)
  client.appendAnswer('waiting', true)
  native.getItem.mockImplementation(() => {
    throw new Error('Read failed')
  })
  storageEvent(target, ANSWERED_HISTORY_KEY)
  await locks.release()
  expect(client.getProgress().answeredHistory).toEqual(
    new Map([['waiting', [true]]]),
  )
  expect(native.setItem).not.toHaveBeenCalled()
})

test('a failed post-write refresh keeps a committed answer exactly once and later deltas in memory', () => {
  const native = createStorage()
  const storage = {
    ...native,
    setItem: (key: string, value: string) => {
      native.setItem(key, value)
      if (key === SCHEMA_VERSION_KEY) {
        native.getItem.mockImplementation(() => {
          throw new Error('Read failed')
        })
      }
    },
  }
  const client = createClient(storage)
  client.appendAnswer('id', true)
  client.appendAnswer('id', false)
  expect(client.getProgress().answeredHistory).toEqual(
    new Map([['id', [true, false]]]),
  )
  expect(native.setItem).toHaveBeenCalledTimes(2)
})

test('does not temporarily remove the optimistic operation from subscriber snapshots', () => {
  const client = createClient(createStorage())
  const snapshots = vi.fn<(progress: GameSessionProgressSnapshot) => void>()
  client.subscribeProgress(snapshots)
  snapshots.mockClear()
  client.appendAnswer('id', true)
  expect(
    snapshots.mock.calls.map(([snapshot]) =>
      snapshot.answeredHistory.get('id'),
    ),
  ).toEqual([[true], [true]])
})

test('default storage bootstrap tolerates a throwing native getter and keeps progress across remounts', async () => {
  const availableStorage = globalThis.localStorage
  const getStorage = vi.fn(() => {
    throw new Error('Storage access denied')
  })
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: getStorage,
  })
  try {
    vi.resetModules()
    const storage = await import('@/stores/game-session-storage')
    const initial = storage.loadGameSessionStorage()
    expect(initial.selectedTool).toBe('Google Chrome')
    expect(initial.answeredHistory).toEqual(new Map())
    const accesses = getStorage.mock.calls.length
    const firstMount = storage.createGameSessionStoragePersistence()
    const unsubscribe = firstMount.subscribeProgress(() => undefined)
    firstMount.appendAnswer('local', true)
    firstMount.removeShortcut('local')
    unsubscribe()

    const secondMount = storage.createGameSessionStoragePersistence()
    secondMount.appendAnswer('local', false)
    expect(storage.loadGameSessionStorage()).toMatchObject({
      answeredHistory: new Map([['local', [true, false]]]),
      removedIds: new Set(['local']),
    })
    expect(getStorage).toHaveBeenCalledTimes(accesses)
  } finally {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: availableStorage,
      writable: true,
    })
  }
})
