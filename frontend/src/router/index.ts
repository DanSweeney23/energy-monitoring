import { createRouter, createWebHistory } from 'vue-router'
import LiveGeneration from '../views/LiveGeneration/LiveGeneration.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/livegeneration',
      name: 'live generation',
      component: LiveGeneration
    }
  ]
})

export default router
