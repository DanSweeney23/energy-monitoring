<script setup lang="ts">
import { computed } from 'vue';
import { useLiveGenerationRequest } from './LiveGeneration/composables';
import RequestLoader from '@/components/RequestLoader.vue';
import { FuelType, transformFuelsData, type FuelValue } from './LiveGeneration/models';

const liveGenerationRequest = useLiveGenerationRequest(true);

const rawDateTime = computed(() => (liveGenerationRequest.data.value?.date.N || '') + (liveGenerationRequest.data.value?.time.N || ''))
const dashedDateTime = computed(() => rawDateTime.value?.replace(/(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})(\d{2})/, "$3-$2-$1T$4:$5:$6Z"))
const liveTime = computed(() => new Date(dashedDateTime.value));

const fuelsData = computed(() => liveGenerationRequest.data.value ? transformFuelsData(liveGenerationRequest.data.value!) : [])

const calculateFuelGeneration = (fuels: FuelValue[], type: FuelType) => fuels.filter(item => item.type == type).map(item => item.value).reduce((acc, curr) => acc + curr, 0);

const totalFossils = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Fossil));
const totalRenewables = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Renewable));
const totalLC = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.LowCarbon));
const totalUnknown = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Unknown));
const totalImports = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Interconnection));
const totalDomestic = computed(() => totalFossils.value + totalRenewables.value + totalLC.value + totalUnknown.value);
</script>

<template>
  <div class="live-generation-1">
    <h2>Stats</h2>
    <RequestLoader :request="liveGenerationRequest">
      <template v-if="liveGenerationRequest.data.value">
        <ul>
          <li>
            Live generation data as of {{ liveTime.toLocaleString('en-GB', {
              hour: 'numeric', hour12: true, minute: 'numeric'
            }) }}
          </li>
          <li>
            {{ ((totalDomestic + totalImports) / 1000).toFixed(2) }}GW total demand
          </li>
          <li>
            {{ (totalDomestic / 1000).toFixed(2) }}GW domestic generation
          </li>
          <li>
            {{ (totalImports / 1000).toFixed(2) }}GW energy imports
          </li>
        </ul>
      </template>
    </RequestLoader>
  </div>
  <div class="live-generation-2">
    <h2>Live Generation 2</h2>
  </div>
</template>

<style>
.live-generation-1 {
  grid-row: 2;
  grid-column: 1 / 3;
}

.live-generation-1 ul li {
  margin-top: 5px;
  font-size: 1.2rem;
}

.live-generation-2 {
  grid-row: 2;
  grid-column: 3 / 6;
}

@media (min-width: 1024px) {
  .live-generation {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
