import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    server: { https: true },
    plugins: [ 
        mkcert(), 
        vue()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    assetsInclude: ['**/*.mind', '**/*.fset', '**/*.fset3', '**/*.iset', '**/*.dat', '**/*.hiro']
})
