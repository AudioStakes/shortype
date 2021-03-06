module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:vue/essential',
    'plugin:@typescript-eslint/recommended',
    '@vue/prettier',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  plugins: ['vue', '@typescript-eslint', 'simple-import-sort'],
  rules: {
    'vue/multi-word-component-names': [
      'error',
      {
        ignores: ['Header', 'Footer'],
      },
    ],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
}
