import { createRouter, createWebHistory } from 'vue-router'
import LiveGeneration from '../views/LiveGeneration.vue';
import HistoricGeneration from '../views/HistoricGeneration.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/livegeneration',
      name: 'live generation',
      component: LiveGeneration
    },
    {
      path: '/historicgeneration',
      name: 'historic generation',
      component: HistoricGeneration
    }
  ]
})

export default router
