import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    // 개발 서버에서도 백엔드(FastAPI)와 노션 자산을 그대로 쓸 수 있게 프록시
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/page_img': 'https://taejun.dev',
      '/papers': 'https://taejun.dev',
    },
  },
})
