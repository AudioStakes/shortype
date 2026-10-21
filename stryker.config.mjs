import policy from './quality-policy.json' with { type: 'json' }

export default {
  mutate: policy.mutation.targets,
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  vitest: { configFile: 'vite.config.ts' },
  coverageAnalysis: 'perTest',
  incremental: false,
  allowEmpty: false,
  concurrency: 2,
  reporters: ['progress', 'clear-text', 'html', 'json'],
  jsonReporter: { fileName: 'reports/mutation/mutation.json' },
  htmlReporter: { fileName: 'reports/mutation/mutation.html' },
  thresholds: {
    high: policy.mutation.global,
    low: policy.mutation.global,
    break: policy.mutation.global,
  },
}
