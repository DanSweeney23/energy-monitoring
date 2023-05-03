<script setup lang="ts">
import { parseForecastResponse } from '@/api/models/forecastModels';
import { useDemandForecastRequest } from '@/api/requests';
import { computed, watch } from 'vue';
import RequestLoader from "@/components/RequestLoader.vue";
import { makeDemandGraph } from './utils';

const demandForecastRequest = useDemandForecastRequest(true);
const forecast = computed(() => demandForecastRequest.data.value ? parseForecastResponse(demandForecastRequest.data.value) : undefined)

const getDaysAhead = (start: Date, days: number) => {
  const endDate = new Date(start);
  endDate.setDate(endDate.getDate() + days);
  endDate.setMinutes(0);
  endDate.setHours(0);
  endDate.setSeconds(0);

  return endDate;
}

const yMax = computed(() => forecast.value ? Math.max(...forecast.value.map(item => item.demand)) : 0);

watch(forecast, () => {
  if (!forecast.value) return;
  const endDate = getDaysAhead(forecast.value[0].date, 1);

  const filteredData = forecast.value.filter(item => item.date <= endDate);
  makeDemandGraph("tomorrow-forecast-chart", filteredData);
});

watch(forecast, () => {
  if (!forecast.value) return;
  const endDate = getDaysAhead(forecast.value[0].date, 7);

  const filteredData = forecast.value.filter(item => item.date < endDate);
  makeDemandGraph("demand-7-day-forecast-chart", filteredData);
});

watch(forecast, () => {
  if (!forecast.value) return;
  makeDemandGraph("demand-14-day-forecast-chart", forecast.value);
});
</script>

<template>
  <div class="demand-forecast-1">
    <h2>Tomorrow's demand forecast</h2>
    <RequestLoader :request="demandForecastRequest">
      <div id="tomorrow-forecast-chart"></div>
    </RequestLoader>
  </div>
  <div class="demand-forecast-2">
    <h2>Next week's demand forecast</h2>
    <RequestLoader :request="demandForecastRequest">
      <div id="demand-7-day-forecast-chart"></div>
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

#tomorrow-forecast-chart {
  width: 100%;
  height: 300px;
}

.demand-forecast-2 {
  grid-column: 6 / 11;
}

#demand-7-day-forecast-chart {
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