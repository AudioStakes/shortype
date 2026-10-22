import { expect, test } from 'vitest'
import { parseCsv } from '@/../data/parse-csv'

test.each([
  '',
  '\n',
  '\r\n',
  'header',
  'header\n',
  '\ufeffheader\r\n\r\n',
])('empty or header-only input has no records: %j', (input) => {
  expect(parseCsv(input)).toEqual([])
})

test('preserves delimiters, escaped quotes, line breaks and unicode inside quoted cells', () => {
  expect(
    parseCsv(
      Buffer.from(
        '\ufeffid,description,empty\r\n1,"a,b\n日本語 ""quoted""",\r\n2,"line\r\nb",tail',
      ),
    ),
  ).toEqual([
    { id: '1', description: 'a,b\n日本語 "quoted"', empty: '' },
    { id: '2', description: 'line\r\nb', empty: 'tail' },
  ])
})

test('preserves explicit empty cells and skips only entirely empty rows', () => {
  expect(parseCsv('a,b,c\nx,,\ny,z,\n,,\n , ,\n1,2,3\n')).toEqual([
    { a: 'x', b: '', c: '' },
    { a: 'y', b: 'z', c: '' },
    { a: ' ', b: ' ', c: '' },
    { a: '1', b: '2', c: '3' },
  ])
})

test.each([
  ['unclosed quoted field', 'a,b\n1,"two\n3,four'],
  ['extra column', 'a,b\n1,two,three'],
  ['missing column', 'a,b\n1'],
  ['quote inside an unquoted field', 'a,b\n1,t"wo'],
  ['text after a closing quote', 'a,b\n1,"two"three'],
])('rejects malformed CSV: %s', (_description, input) => {
  expect(() => parseCsv(input)).toThrow()
})

test('keeps a trailing quoted cell without a terminal newline', () => {
  expect(parseCsv('a,b\n,""')).toEqual([])
  expect(parseCsv('a,b\n,"x"')).toEqual([{ a: '', b: 'x' }])
  expect(parseCsv('a,b\n"x",')).toEqual([{ a: 'x', b: '' }])
})
