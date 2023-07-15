/* eslint-env node */
module.exports = {
  root: true,
  extends: ['wdzeng/typescript'],
  env: {
    browser: true,
    es2022: true,
    node: false
  },
  parserOptions: {
    ecmaVersion: 13,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  rules: {
    // Your custom rules go here ...
    'no-console': 'error',
    'prettier/prettier': 'warn'
  }
}
