<script setup lang="ts">
import { computed, watch } from 'vue';
import { useLiveGenerationRequest } from './composables';
import RequestLoader from '@/components/RequestLoader.vue';
import { FuelType, transformFuelsData, type FuelValue } from './models';

import { Root, Color } from "@amcharts/amcharts5";
import { PieChart, PieSeries } from "@amcharts/amcharts5/percent";

const liveGenerationRequest = useLiveGenerationRequest(true);

const rawDateTime = computed(() => (liveGenerationRequest.data.value?.date.N || '') + (liveGenerationRequest.data.value?.time.N || ''))
const dashedDateTime = computed(() => rawDateTime.value?.replace(/(\d{2})(\d{2})(\d{4})(\d{2})(\d{2})(\d{2})/, "$3-$2-$1T$4:$5:$6Z"))
const liveTime = computed(() => new Date(dashedDateTime.value));

const fuelsData = computed(() => liveGenerationRequest.data.value ? transformFuelsData(liveGenerationRequest.data.value!) : [])

const calculateFuelGeneration = (fuels: FuelValue[], type: FuelType) => fuels.filter(item => item.type == type).map(item => item.value).reduce((acc, curr) => acc + curr, 0);

const totalFossils = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Fossil));
const totalRenewables = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Renewable));
const totalLC = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.LowCarbon));
const totalImports = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Interconnection));
const totalUnknown = computed(() => calculateFuelGeneration(fuelsData.value, FuelType.Unknown));

const sortedFuelTypes = computed(() => [
  { name: "Fossil Fuels", value: totalFossils.value, color: "#ff6a6a" },
  { name: "Renewables", value: totalRenewables.value, color: "#6dd158" },
  { name: "Other Low Carbon", value: totalLC.value, color: "#68989b" },
  { name: "Imports", value: totalImports.value, color: "#999" }
].sort((x, y) => x.value < y.value ? 1 : 0))

const totalDomestic = computed(() => totalFossils.value + totalRenewables.value + totalLC.value + totalUnknown.value);
const domesticFuels = computed(() => fuelsData.value.filter(item => item.type != FuelType.Interconnection && item.value != 0));
const sortedDomesticFuels = computed(() => domesticFuels.value.sort((x, y) => x.value < y.value ? 1 : 0));

watch(sortedDomesticFuels, () => {
  if (sortedDomesticFuels.value.length === 0) return;

  const chartRoot = Root.new("gen-by-fuel-chart");

  const chart = chartRoot.container.children.push(PieChart.new(chartRoot, {}));
  const series = chart.series.push(
    PieSeries.new(chartRoot, {
      valueField: "value",
      categoryField: "name"
    })
  );
  series.labels.template.adapters.add("forceHidden", () => true);
  series.ticks.template.adapters.add("forceHidden", () => true);
  series.slices.template.adapters.add("stroke", () => Color.fromString("#333"));
  series.slices.template.adapters.add("strokeWidth", () => 3);
  series.slices.template.adapters.add("fill", (fill, target) => target.dataItem ? Color.fromString((target.dataItem.dataContext as FuelValue).color) : fill);

  series.data.setAll(sortedDomesticFuels.value);
});

watch(sortedFuelTypes, () => {
  const chartRoot = Root.new("fuels-type-chart");

  const chart = chartRoot.container.children.push(PieChart.new(chartRoot, {}));
  const series = chart.series.push(
    PieSeries.new(chartRoot, {
      valueField: "value",
      categoryField: "name"
    })
  );

  series.labels.template.adapters.add("forceHidden", () => true);
  series.ticks.template.adapters.add("forceHidden", () => true);
  series.slices.template.adapters.add("stroke", () => Color.fromString("#333"));
  series.slices.template.adapters.add("strokeWidth", () => 3);
  series.slices.template.adapters.add("fill", (fill, target) => target.dataItem ? Color.fromString((target.dataItem.dataContext as FuelValue).color) : fill);

  series.data.setAll(sortedFuelTypes.value);
});
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
    <h2>Domestic Generation By Fuel Type</h2>
    <RequestLoader :request="liveGenerationRequest">
      <div style="display:grid; grid-template-columns:50% 50%;align-items: center;">
        <div id="gen-by-fuel-chart"></div>
        <div id="gen-by-fuel-table">
          <table>
            <tr v-for="(fuel, index) in sortedDomesticFuels" :key="index" :style="{ color: fuel.color }">
              <td>{{ fuel.name }}</td>
              <td style="padding-left:1rem">{{ (fuel.value / 1000).toFixed(2) }} GW</td>
            </tr>
          </table>
        </div>
      </div>
    </RequestLoader>
  </div>
  <div class="live-generation-3">
    <h2>Fuel types</h2>
    <RequestLoader :request="liveGenerationRequest">
      <div style="display:grid; grid-template-columns:50% 50%;align-items: center;">
        <div id="fuels-type-chart"></div>
        <div id="fuels-type-table">
          <table>
            <tr v-for="(fuel, index) in sortedFuelTypes" :key="index" :style="{ color: fuel.color }">
              <td>{{ fuel.name }}</td>
              <td style="padding-left:1rem">{{ (fuel.value / 1000).toFixed(2) }} GW</td>
            </tr>
          </table>
        </div>
      </div>
    </RequestLoader>
  </div>
  <div class="live-generation-4">
    <h2>Info</h2>
    <ul>
      <li>This data is taken from the <a target="_blank"
          href="https://www.elexon.co.uk/data/balancing-mechanism-reporting-agent">balancing and reporting mechanism</a>
      </li>
      <li>The data only includes the national network, not local distribution networks</li>
      <li>Solar and onshore wind are not connected to the national distribution network, so they are not included here
      </li>
    </ul>
  </div>
</template>

<style>
.live-generation-1 {
  grid-column: 1 / 3;
}

.live-generation-1 ul li {
  margin-top: 5px;
}

.live-generation-2 {
  grid-column: 3 / 6;
}

.live-generation-3 {
  grid-column: 1 / 4;
}

.live-generation-4 {
  grid-column: 4 / 6;
}

#gen-by-fuel-table {
  font-size: 1.1rem;
  vertical-align: middle;
}

#gen-by-fuel-chart {
  width: 100%;
  height: 300px;
}

#fuels-type-chart {
  width: 100%;
  height: 300px;
}
</style>