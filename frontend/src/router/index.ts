import { createRouter, createWebHistory } from 'vue-router'
import LiveGeneration from '@/views/LiveGeneration/LiveGeneration.vue';
import DailyGeneration from '@/views/DailyGeneration/DailyGeneration.vue';
import DemandForecast from '@/views/DemandForecast/DemandForecast.vue';
import WindForecast from '@/views/WindForecast/WindForecast.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'live generation',
      component: LiveGeneration
    },
    {
      path: '/dailygeneration',
      name: 'daily generation',
      component: DailyGeneration
    },
    {
      path: '/demandforecast',
      name: 'demand forecase',
      component: DemandForecast
    },
    {
      path: '/windforecast',
      name: 'wind forecase',
      component: WindForecast
    }
  ]
})

export default router
