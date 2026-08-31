import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    base: './',
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-audio': ['tone', '@coderline/alphatab'],
                    'vendor-charts': ['chart.js', 'react-chartjs-2'],
                    'vendor-react': ['react', 'react-dom'],
                    'vendor-icons': ['lucide-react']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    },
    server: {
        port: 5173,
        open: true,
        proxy: {
            '/harphub': {
                target: 'http://localhost',
                changeOrigin: true
            }
        }
    },
    optimizeDeps: {
        exclude: ['@coderline/alphatab']
    },
    assetsInclude: ['**/*.gp', '**/*.gp3', '**/*.gp4', '**/*.gp5', '**/*.gpx', '**/*.sf2']
})
