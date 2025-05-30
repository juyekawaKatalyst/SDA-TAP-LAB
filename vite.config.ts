import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';
import sveltePreprocess from 'svelte-preprocess'
import { RollupPluginObfuscatorOptions } from 'rollup-plugin-obfuscator';
import copy from 'rollup-plugin-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = "index.html";
// Obfuscator options
const obfuscatorOptions: RollupPluginObfuscatorOptions["options"] = {

  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  debugProtectionInterval: 0,
  disableConsoleOutput: true,
  identifierNamesGenerator: 'hexadecimal',
  /*log: false,
 numbersToExpressions: false,
 renameGlobals: false,
 selfDefending: true,
 simplify: true,
 splitStrings: false,
 stringArray: true,
 stringArrayCallsTransform: false,
 stringArrayEncoding: [],
 stringArrayIndexShift: true,
 stringArrayRotate: true,
 stringArrayShuffle: true,
 stringArrayWrappersCount: 1,
 stringArrayWrappersChainedCalls: true,
 stringArrayWrappersParametersMaxCount: 2,
 stringArrayWrappersType: 'variable',
 stringArrayThreshold: 0.75,
 unicodeEscapeSequence: false*/

};

// Your banner text
const banner = `/*!
* © ${new Date().getFullYear()} Lyteworx Automation Systems, LLC. and DigitalArsenal.io, Inc. - All Rights Reserved.
*
* No part of this software may be reproduced, distributed,
* or transmitted in any form or by any means, including photocopying, recording, or other
* electronic or mechanical methods, without the prior written permission.
* Reverse engineering, disassembly, or decompilation of this software is strictly prohibited.
* 
*/`;

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [svelte({
    preprocess: sveltePreprocess(),
    onwarn: (warning, handler) => {
      if (warning.code.startsWith('a11y')) {
        return;
      }
      // Handle all other warnings as usual
      handler(warning);
    },

  }),
  copy({
    targets: [
      { src: './coi-serviceworker.js', dest: 'docs' }
    ],
    hook: 'writeBundle' // Determines at which stage in the build the files should be copied
  })
    // viteCompression({ algorithm: "brotliCompress" })
    // process.env.NODE_ENV === 'production' && Obfuscator({ global: true, options: obfuscatorOptions })
  ],
  build: {
    assetsInlineLimit: 0, // This ensures all assets are inlined
    minify: "terser",
    terserOptions: {
      // Terser options to prevent stripping of debugger
      compress: {
        drop_debugger: false // Do not remove debugger statements
      },
      mangle: {
        properties: { regex: /trackFromTo/g },
        toplevel: true,
        keep_classnames: true,
        keep_fnames: true
      }
    },
    emptyOutDir: false,
    outDir: "docs",
    rollupOptions: {
      onwarn(warning, warn) {
        // Check if the warning is a 'PLUGIN_WARNING' from 'vite:resolve'
        if (warning.code === 'PLUGIN_WARNING' && warning.plugin === 'vite:resolve') {
          // Check if the warning message is about externalizing modules for browser compatibility
          if (warning.message && warning.message.includes('has been externalized for browser compatibility')) {
            return; // This suppresses the specific warning
          }
        }
        // Handle all other warnings as usual
        warn(warning);
      },
      external: ['cesium'],
      input: {
        app,
      },
      output: {
        banner
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'window.CESIUM_BASE_URL': JSON.stringify("packages/orbpro/Build/Cesium"),
  },
  server: {
    host: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
});