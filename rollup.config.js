import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'

const popupConfig = {
  input: 'src/scripts/popup.ts',
  output: {
    dir: 'dist/scripts',
    format: 'cjs',
  },
  plugins: [typescript()],
}

const contentScriptConfig = {
  input: 'src/scripts/content-script.ts',
  output: {
    dir: 'dist/scripts',
    format: 'cjs',
  },
  plugins: [
    typescript(),
    replace({
    values: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'PRODUCTION'),
      },
      preventAssignment: true,
    }),
  ],
}

export default [popupConfig, contentScriptConfig]
