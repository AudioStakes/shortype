import { execFileSync } from 'node:child_process'
import { basename, resolve } from 'node:path'
import ts from 'typescript'

const projectNames = [
  'tsconfig.json',
  'tsconfig.node.json',
  'tsconfig.test.json',
  'tsconfig.e2e.json',
]
const generatedDirectories = [
  'node_modules',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
]
const forbiddenBrowserGlobals = [
  'test',
  'it',
  'describe',
  'expect',
  'vi',
  'vitest',
  'process',
  'Buffer',
  '__dirname',
  '__filename',
  'require',
  'module',
  'exports',
]

const canonicalPath = (path: string) => {
  const absolute = resolve(path)
  return ts.sys.useCaseSensitiveFileNames ? absolute : absolute.toLowerCase()
}

export function checkTypeCoverage(root: string, files: readonly string[]) {
  const readProject = (name: string) => {
    const configPath = resolve(root, name)
    const config = ts.readConfigFile(configPath, (file) =>
      ts.sys.readFile(file),
    )
    if (config.error) {
      throw new Error(
        ts.flattenDiagnosticMessageText(config.error.messageText, '\n'),
      )
    }
    const project = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      root,
      undefined,
      configPath,
    )
    if (project.errors.length > 0) {
      throw new Error(
        project.errors
          .map((error) =>
            ts.flattenDiagnosticMessageText(error.messageText, '\n'),
          )
          .join('\n'),
      )
    }
    return project
  }
  const browser = readProject('tsconfig.json')
  const projects = [browser, ...projectNames.slice(1).map(readProject)]
  const roots = new Set(
    projects.flatMap((project) => project.fileNames.map(canonicalPath)),
  )
  const sourceFiles = [...new Set(files)].filter(
    (file) =>
      /\.[cm]?[jt]sx?$/.test(file) &&
      !generatedDirectories.some((directory) =>
        file.startsWith(`${directory}/`),
      ) &&
      ts.sys.fileExists(resolve(root, file)),
  )
  const uncovered = sourceFiles.filter(
    (file) => !roots.has(canonicalPath(resolve(root, file))),
  )
  if (uncovered.length > 0) {
    throw new Error(
      `Files missing from TypeScript project roots:\n${uncovered.join('\n')}`,
    )
  }

  const checker = ts
    .createProgram(browser.fileNames, browser.options)
    .getTypeChecker()
  const leakedGlobals = forbiddenBrowserGlobals.filter((name) =>
    checker.resolveName(name, undefined, ts.SymbolFlags.Value, false),
  )
  if (leakedGlobals.length > 0) {
    throw new Error(
      `Forbidden browser ambient globals: ${leakedGlobals.join(', ')}`,
    )
  }

  return sourceFiles.length
}

export function runTypeCoverage(root: string) {
  const files = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: root, encoding: 'utf8' },
  )
    .split('\0')
    .filter(Boolean)
  const count = checkTypeCoverage(root, files)
  return `Type coverage: ${count} files across ${projectNames.length} projects; browser globals isolated.\n`
}

if (basename(process.argv[1] ?? '') === 'check-type-coverage.ts') {
  process.stdout.write(runTypeCoverage(process.cwd()))
}
