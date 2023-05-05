import { createRouter, createWebHistory } from 'vue-router'

import LiveGeneration from '@/views/LiveGeneration/LiveGeneration.vue';
import DailyGeneration from '@/views/DailyGeneration/DailyGeneration.vue';
import GridDemand from '@/views/GridDemand/GridDemand.vue';
import WindForecast from '@/views/WindForecast/WindForecast.vue';
import CarbonIntensity from '@/views/CarbonIntensity/CarbonIntensity.vue';

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
      path: '/demand',
      name: 'grid demand',
      component: GridDemand
    },
    {
      path: '/windforecast',
      name: 'wind forecast',
      component: WindForecast
    },
    {
      path: '/carbon',
      name: 'carbon intensity',
      component: CarbonIntensity
    }
  ]
})

export default router
