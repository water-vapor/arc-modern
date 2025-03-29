import { createRouter, createWebHistory } from 'vue-router'
import PuzzleView from '@/views/PuzzleView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: PuzzleView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 