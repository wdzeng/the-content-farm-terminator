import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'

let browser_
switch (process.env.BROWSER) {
  case undefined:
    console.warn(
      '\x1b[33mBrowser is not set so fallback to bundle for Google CHrome.',
      'Set BROWSER to fix this problem.\x1b[0m'
    )
    browser_ = 'browser'
    break
  case 'chrome':
    console.warn('\x1b[33mBundling for Google Chrome.\x1b[0m')
    browser_ = 'chrome'
    break
  case 'firefox':
    console.warn('\x1b[33mBundling for Mozilla Firefox.\x1b[0m')
    browser_ = 'browser'
    break
  default:
    console.warn('\x1b[33mUnknown browser so fallback to bundle for Google Chrome.\x1b[0m')
    browser_ = 'chrome'
    break
}

const nodeResolveOptions = { browser: true, modulesOnly: true }
const replaceOptions = {
  values: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    '__storage__': `${browser_}.storage`,
    '__i18n__': `${browser_}.i18n`
  },
  preventAssignment: true
}
const terserOptions = {
  ecma: '2022',
  module: true,
  mangle: true
}

function getPlugins() {
  const ret = [replace(replaceOptions), typescript(), nodeResolve(nodeResolveOptions)]
  if (process.env.NODE_ENV === 'production') {
    ret.push(terser(terserOptions))
  }
  return ret
}

const popupConfig = {
  input: 'src/scripts/popup.ts',
  output: {
    dir: 'dist/scripts',
    format: 'esm'
  },
  plugins: getPlugins()
}

const contentScriptConfig = {
  input: 'src/scripts/content-script.ts',
  output: {
    dir: 'dist/scripts',
    format: 'esm'
  },
  plugins: getPlugins()
}

export default [popupConfig, contentScriptConfig]
