import path from 'node:path'
import { beforeEach, expect, test, vi } from 'vitest'
import createShortcuts from '@/../data/create-shortcuts'

const { readFile, writeFile } = vi.hoisted(() => ({
  readFile: vi.fn<(input: string) => Buffer>(),
  writeFile: vi.fn<(path: string, data: string, encoding: string) => void>(),
}))
vi.mock('node:fs', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:fs')>()
  return {
    ...original,
    default: { ...original, readFileSync: readFile, writeFileSync: writeFile },
    readFileSync: readFile,
    writeFileSync: writeFile,
  }
})

beforeEach(() => {
  readFile.mockReset()
  writeFile.mockReset()
  readFile.mockReturnValue(
    Buffer.from(
      'id,app,os,category,action,keysDescription\nexample,Example,macOS,Tabs,Move,Command + m',
    ),
  )
})

test('generates the matching JSON file using UTF-8 without changing the input CSV', () => {
  createShortcuts('/input/example.csv')
  expect(readFile).toHaveBeenCalledExactlyOnceWith('/input/example.csv')
  expect(writeFile).toHaveBeenCalledExactlyOnceWith(
    expect.stringMatching(/src\/constants\/shortcuts\/example\.json$/),
    expect.any(String),
    'utf8',
  )
  const json: unknown = JSON.parse(String(writeFile.mock.calls[0]?.[1]))
  expect(json).toEqual([
    {
      id: 'example',
      app: 'Example',
      os: 'macOS',
      category: 'Tabs',
      action: 'Move',
      keysDescription: 'Command + m',
      keyCombinations: [
        {
          altKey: false,
          ctrlKey: false,
          metaKey: true,
          shiftKey: false,
          key: 'm',
        },
      ],
      isAvailable: true,
      unavailableReason: null,
      needsFillInBlankMode: false,
    },
  ])
})

test('read and validation errors stop before writing a JSON file', () => {
  readFile.mockImplementationOnce(() => {
    throw new Error('Read failed')
  })
  expect(() => createShortcuts('/input/missing.csv')).toThrow('Read failed')
  readFile.mockReturnValueOnce(Buffer.from('id\nexample'))
  expect(() => createShortcuts('/input/invalid.csv')).toThrow(
    'missing a required field',
  )
  expect(writeFile).not.toHaveBeenCalled()
})

test('reports write failures to the invoking script', () => {
  writeFile.mockImplementationOnce(() => {
    throw new Error('Write failed')
  })
  expect(() => createShortcuts('/input/example.csv')).toThrow('Write failed')
})

test('CLI processes each explicit CSV argument in order', async () => {
  const originalArgv = process.argv
  try {
    process.argv = [
      process.execPath,
      path.resolve('data/script.ts'),
      '/input/one.csv',
      '/input/two.csv',
    ]
    await import('@/../data/script')
    expect(readFile.mock.calls.map((call) => call[0])).toEqual([
      '/input/one.csv',
      '/input/two.csv',
    ])
    expect(writeFile).toHaveBeenCalledTimes(2)
  } finally {
    process.argv = originalArgv
  }
})
