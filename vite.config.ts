import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import react from '@vitejs/plugin-react-swc'
import * as fs from 'fs'
import * as path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, loadEnv } from 'vite'
import { checker } from 'vite-plugin-checker'
import { createHtmlPlugin } from 'vite-plugin-html'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import tsconfigPaths from 'vite-tsconfig-paths'

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relative: string) => path.resolve(appDirectory, relative)
const root = path.resolve(__dirname, resolveApp('src'))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // const isProduction = env.VITE_ENVIRONMENT === 'production'
  // const isDevelopment = env.VITE_ENVIRONMENT === 'development'
  const isAnalyze = env.VITE_ENVIRONMENT === 'analyze' || env.VITE_MODE === 'analyze'
  // const buildVersion = env.VITE_APP_BUILD_VERSION

  return {
    ...(env.VITE_PORT
      ? {
          server: {
            port: Number(env.VITE_PORT),
          },
        }
      : {}),
    publicDir: 'static',
    plugins: [
      react(),
      tsconfigPaths(),
      createSvgIconsPlugin({
        iconDirs: [
          path.resolve(process.cwd(), 'src/assets/icons'),
          path.resolve(process.cwd(), 'src/assets/illustrations'),
        ],
        symbolId: '[name]',
      }),
      checker({
        overlay: {
          initialIsOpen: false,
          position: 'br',
        },
        typescript: true,
        eslint: {
          lintCommand: 'eslint "{src,config}/**/*.{jsx,tsx}" --cache --max-warnings=0',
        },
      }),
      createHtmlPlugin({
        minify: true,
        entry: '/src/main.tsx',
        inject: {
          data: {
            host: env.VITE_APP_DOMAIN,
          },
        },
      }),
      ...(isAnalyze
        ? [
            visualizer({
              open: true,
            }),
          ]
        : []),
    ],
    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      dedupe: ['react', 'lodash'],
      alias: {
        '@': `${root}/`,
        '@config': `${root}/config.ts`,
        '@static': `${root}/../static`,
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        plugins: [
          // Enable rollup polyfills plugin
          // used during production bundling
          nodePolyfills({
            globals: {
              Buffer: true,
              global: true,
              process: true,
            },
            protocolImports: true,
          }),
        ],

        output: {
          sourcemap: true,

          manualChunks: {
            lodash: ['lodash'],
            react: ['react', 'react-dom'],
            'bn.js': ['bn.js'],
            '@ethersproject/constants': ['@ethersproject/constants'],
            '@ethersproject/logger': ['@ethersproject/logger'],
            '@ethersproject/bytes': ['@ethersproject/bytes'],
            '@ethersproject/bignumber': ['@ethersproject/bignumber'],
            '@ethersproject/abstract-provider': ['@ethersproject/abstract-provider'],
            '@ethersproject/abstract-signer': ['@ethersproject/abstract-signer'],
            '@ethersproject/providers': ['@ethersproject/providers'],
          },
        },
      },
    },
  }
})
