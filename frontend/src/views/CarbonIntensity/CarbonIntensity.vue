<script setup lang="ts">
import { parseCarbonIntensityResponse } from '@/api/models/carbonModels';
import { useCarbonIntensityForecastRequest } from '@/api/requests';
import RequestLoader from '@/components/RequestLoader.vue';
import { Root, Color, Tooltip } from "@amcharts/amcharts5";
import { XYChart, LineSeries, DateAxis, ValueAxis, AxisRendererX, AxisRendererY, XYCursor } from "@amcharts/amcharts5/xy";
import { computed, watch } from 'vue';

const request = useCarbonIntensityForecastRequest(true);


const carbonData = computed(() => request.data.value ? parseCarbonIntensityResponse(request.data.value) : []);

const currentIntensity = computed(() => carbonData.value.sort((x, y) => x.timestamp < y.timestamp ? 1 : 0)[0]);

watch(carbonData, () => {
  if (carbonData.value.length === 0) return;

  const chartRoot = Root.new('carbon-chart');
  const chart = chartRoot.container.children.push(XYChart.new(chartRoot, {
    maxTooltipDistance: 1000,
  }));


  const xAxis = chart.xAxes.push(DateAxis.new(chartRoot, {
    baseInterval: {
      timeUnit: "minute",
      count: 12
    },
    renderer: AxisRendererX.new(chartRoot, {}),
  }));

  const yAxis = chart.yAxes.push(ValueAxis.new(chartRoot, {
    renderer: AxisRendererY.new(chartRoot, {}),
    min: 0
  }));

  xAxis.get("renderer").labels.template.adapters.add("fill", () => Color.fromString("#ffffff"));
  xAxis.get("renderer").grid.template.adapters.add("stroke", () => Color.fromString("#ffffff"))
  yAxis.get("renderer").labels.template.adapters.add("fill", () => Color.fromString("#ffffff"));
  yAxis.get("renderer").grid.template.adapters.add("stroke", () => Color.fromString("#ffffff"))


  const color = Color.fromString('#ff6a6a');

  const series = chart.series.push(LineSeries.new(chartRoot, {
    name: "Intensity",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "intensity",
    valueXField: "timestamp",
    stroke: color,
    fill: color,
    tooltip: Tooltip.new(chartRoot, {
      pointerOrientation: "horizontal",
      labelText: `{timeStr}\n\n {valueY} gCO2/kWh`,
    }),
  }));

  chart.set("cursor", XYCursor.new(chartRoot, { snapToSeries: [series] }));

  series.strokes.template.adapters.add("strokeWidth", () => 3)

  series.data.setAll(carbonData.value);

})
</script>

<template>
  <div class="grid-box carbon-1">
    <h2>Last 7 days carbon intensity</h2>
    <RequestLoader :request="request">
      <div id="carbon-chart"></div>
    </RequestLoader>
  </div>
  <div class="carbon-2">
    <div class="grid-box current-intensity-container">
      <RequestLoader :request="request">
        <h3>Current intensity: {{ currentIntensity?.intensity ?? 0 }} gCO2/kWh</h3>
      </RequestLoader>
    </div>

    <div class="grid-box">
      <h2>Info</h2>
      <ul>
        <li>This data is from the <a href="https://carbonintensity.org.uk/" target="_blank">carbon intensity API</a> by National Grid,
          WEF, University of Oxford, and Environmental Defence Fund.</li>
        <li>The data measures carbon emissions from electricty generation only, not other sources of power.</li>
        <li>Unlike other pages on this site, it also includes estimates of solar & onshore wind, as well as imports.</li>
        <li>It's showing the emissions per kWh generated, not total emissions from the power grid.</li>
      </ul>
    </div>

  </div>
</template>

<style>
.carbon-1 {
  grid-column: 1 / 7;
}

.carbon-2 {
  grid-column: 7 / 11;
}

.current-intensity-container {
  margin-bottom: 10px;
  text-align: center;
}


#carbon-chart {
  width: 100%;
  height: 400px;
}
</style>