<script setup lang="ts">
import { parseForecastResponse, type Demand } from '@/api/models/demandForecastModels';
import { useDailyGenerationRequest, useDemandForecastRequest } from '@/api/requests';
import { computed, watch } from 'vue';
import RequestLoader from "@/components/RequestLoader.vue";
import { makeDemandGraph } from './utils';
import { convertDateTime } from '@/api/models/generationModels';

const demandForecastRequest = useDemandForecastRequest(true);
const forecast = computed(() => demandForecastRequest.data.value ? parseForecastResponse(demandForecastRequest.data.value) : undefined)

const dailyGenerationRequest = useDailyGenerationRequest(true);
const todaysDemand = computed((): Demand[] => {
  if ((dailyGenerationRequest.data.value?.length ?? 0) === 0) return [];

  return dailyGenerationRequest.data.value!.map(instant => {
    const date = convertDateTime(instant.date.N, instant.time.N);

    return {
      date,
      timestamp: date.getTime(),
      timeStr: date.toLocaleString(),
      demand: instant.fuels.L.reduce((total, fuel) => total + parseInt(fuel.M.value.N), 0)
    }
  })
})

const getDaysAhead = (start: Date, days: number) => {
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + days);
  endDate.setMinutes(0);
  endDate.setHours(0);
  endDate.setSeconds(0);

  return endDate;
}

watch(todaysDemand, () => {
  if (!todaysDemand.value) return;
  makeDemandGraph("today-demand-chart", todaysDemand.value, '#6dd158');
});

watch(forecast, () => {
  if (!forecast.value) return;
  const endDate = getDaysAhead(forecast.value[0].date, 1);

  const filteredData = forecast.value.filter(item => item.date <= endDate);
  makeDemandGraph("tomorrow-forecast-chart", filteredData);
});

watch(forecast, () => {
  if (!forecast.value) return;
  makeDemandGraph("demand-14-day-forecast-chart", forecast.value);
});

</script>

<template>
  <div class="demand-forecast-1">
    <h2>Today's demand so far</h2>
    <RequestLoader :request="dailyGenerationRequest">
      <div id="today-demand-chart"></div>
    </RequestLoader>
  </div>
  <div class="demand-forecast-2">
    <h2>Tomorrow's demand forecast</h2>
    <RequestLoader :request="demandForecastRequest">
      <div id="tomorrow-forecast-chart"></div>
    </RequestLoader>
  </div>
  <div class="demand-forecast-3">
    <h2>Next 14 days demand forecast</h2>
    <RequestLoader :request="demandForecastRequest">
      <div id="demand-14-day-forecast-chart"></div>
    </RequestLoader>
  </div>
  <div class="demand-forecast-4">
    <h2>Info</h2>
    <ul>
      <li>This data is taken from the <a target="_blank"
          href="https://data.nationalgrideso.com/demand/2-14-days-ahead-national-demand-forecast">National grid ESO</a>
      </li>
      <li>The data is used by the industry to make decisions on balancing supply and demand</li>
    </ul>
  </div>
</template>

<style>
.demand-forecast-1 {
  grid-column: 1 / 6;
}

#today-demand-chart {
  width: 100%;
  height: 300px;
}

.demand-forecast-2 {
  grid-column: 6 / 11;
}

#tomorrow-forecast-chart {
  width: 100%;
  height: 300px;
}

.demand-forecast-3 {
  grid-column: 1 / 6;
}

#demand-14-day-forecast-chart {
  width: 100%;
  height: 300px;
}

.demand-forecast-4 {
  grid-column: 6 / 11;
}
</style>