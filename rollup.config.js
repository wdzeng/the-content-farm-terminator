import typescript from '@rollup/plugin-typescript'

const popupConfig = {
  input: 'src/scripts/popup.ts',
  output: {
    dir: 'dist/scripts',
    format: 'cjs'
  },
  plugins: [typescript()]
}

const contentScriptConfig = {
  input: 'src/scripts/content-script.ts',
  output: {
    dir: 'dist/scripts',
    format: 'cjs'
  },
  plugins: [typescript()]
}

export default [popupConfig, contentScriptConfig]
