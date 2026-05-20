export type CsvRecord = Record<string, string>

export const parseCsv = (input: string | Buffer): CsvRecord[] => {
  const text = input.toString('utf8').replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          cell += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        cell += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
      continue
    }

    if (char === ',') {
      row.push(cell)
      cell = ''
      continue
    }

    if (char === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      continue
    }

    if (char === '\r') {
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  const headers = rows.shift() ?? []
  return rows
    .filter((values) => values.some((value) => value.length > 0))
    .map((values) =>
      headers.reduce<CsvRecord>((record, header, index) => {
        record[header] = values[index] ?? ''
        return record
      }, {}),
    )
}
