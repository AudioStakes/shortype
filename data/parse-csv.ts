import { parse } from 'csv-parse/sync'

export type CsvRecord = Record<string, string>

export const parseCsv = (input: string | Buffer): CsvRecord[] =>
  parse<CsvRecord>(input, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
  }).filter((record) => Object.values(record).some((value) => value.length > 0))
