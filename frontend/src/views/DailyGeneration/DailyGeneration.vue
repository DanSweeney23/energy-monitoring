<script setup lang="ts">
import { computed, watch } from 'vue';
import { useDailyGenerationRequest } from '@/api/requests';
import { convertDateTime, transformFuelsData, FuelType, getFuelTypeColor } from '@/api/models/generationModels';
import type { FuelValue } from "@/api/models/generationModels";
import RequestLoader from "@/components/RequestLoader.vue";
import { Root, Color, Tooltip, Legend, p100, p50, Theme } from "@amcharts/amcharts5";
import { XYChart, LineSeries, DateAxis, ValueAxis, AxisRendererX, AxisRendererY, XYCursor } from "@amcharts/amcharts5/xy";

const dailyGenerationRequest = useDailyGenerationRequest(true);

const fuelsData = computed(() => dailyGenerationRequest.data.value?.length ?
  dailyGenerationRequest.data.value.map(item => ({ fuels: transformFuelsData(item), time: convertDateTime(item.date.N, item.time.N) }))
  : []);

type FuelTimeSeries = { [key: string]: (FuelValue & { time: number, timeStr: string })[] };
const timeseriesData = computed(() => {
  const series: FuelTimeSeries = {};

  fuelsData.value.forEach(generationInstant => {
    generationInstant.fuels.forEach(fuel => {
      if (!(fuel.acronym in series)) {
        series[fuel.acronym] = []
      }
      series[fuel.acronym].push({
        ...fuel, time: generationInstant.time.getTime(), timeStr: generationInstant.time.toLocaleString('en-GB', {
          hour: 'numeric', hour12: true, minute: 'numeric'
        })
      })
    })
  });

  return series;
});

type TypeTimeSeries = { [key: string]: { percent: number, time: number, timeStr: string }[] };
const typeTimeSeriesData = computed(() => {
  const series: TypeTimeSeries = {
    [FuelType.Fossil]: [],
    [FuelType.Renewable]: [],
    [FuelType.LowCarbon]: [],
    [FuelType.Interconnection]: [],
    [FuelType.Unknown]: []
  };

  fuelsData.value.forEach(generationInstant => {
    const values: { [key: string]: number } = {
      [FuelType.Fossil]: 0,
      [FuelType.Renewable]: 0,
      [FuelType.LowCarbon]: 0,
      [FuelType.Interconnection]: 0,
      [FuelType.Unknown]: 0
    };

    generationInstant.fuels.forEach(fuel => {
      values[fuel.type] += fuel.value;
    });

    const total = Object.keys(values).reduce((acc, type) => acc + values[type], 0)

    Object.keys(values).forEach(fuelType => {
      series[fuelType].push({
        time: generationInstant.time.getTime(),
        timeStr: generationInstant.time.toLocaleString('en-GB', {
          hour: 'numeric', hour12: true, minute: 'numeric'
        }),
        percent: parseFloat(((values[fuelType] / total) * 100).toFixed(1))
      })
    });
  });

  return series;
});

const timeSeriesFuels = computed(() => {
  const fuelAcronyms = Object.keys(timeseriesData.value).filter(key => {
    return timeseriesData.value[key][0].type != FuelType.Interconnection
  })
  const fuelsTimeSeries: FuelTimeSeries = {};
  fuelAcronyms.forEach(acc => fuelsTimeSeries[acc] = timeseriesData.value[acc]);

  return fuelsTimeSeries;
})

watch(timeSeriesFuels, () => {
  if (Object.keys(timeSeriesFuels.value).length === 0) return;

  const chartRoot = Root.new("gen-by-fuel-chart-daily");
  const chart = chartRoot.container.children.push(XYChart.new(chartRoot, {
    maxTooltipDistance: 0,
    layout: chartRoot.verticalLayout
  }));

  chart.set("cursor", XYCursor.new(chartRoot, {}));

  const xRenderer = AxisRendererX.new(chartRoot, {});

  const xAxis = chart.xAxes.push(DateAxis.new(chartRoot, {
    baseInterval: {
      timeUnit: "minute",
      count: 12
    },
    renderer: xRenderer,
  }));

  const yAxis = chart.yAxes.push(ValueAxis.new(chartRoot, {
    renderer: AxisRendererY.new(chartRoot, {}),
  }));

  xAxis.get("renderer").labels.template.adapters.add("fill", () => Color.fromString("#ffffff"));
  xAxis.get("renderer").grid.template.adapters.add("stroke", () => Color.fromString("#ffffff"))
  yAxis.get("renderer").labels.template.adapters.add("fill", () => Color.fromString("#ffffff"));
  yAxis.get("renderer").grid.template.adapters.add("stroke", () => Color.fromString("#ffffff"))

  Object.keys(timeSeriesFuels.value).forEach(key => {
    const fuelColor = Color.fromString(timeSeriesFuels.value[key][0].color);

    const series = chart.series.push(LineSeries.new(chartRoot, {
      name: timeSeriesFuels.value[key][0].name,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      valueXField: "time",
      stroke: fuelColor,
      fill: fuelColor,
      tooltip: Tooltip.new(chartRoot, {
        pointerOrientation: "horizontal",
        labelText: `${timeSeriesFuels.value[key][0].name}: {valueY} MW {timeStr}`,
      }),
    }));


    series.strokes.template.adapters.add("strokeWidth", () => 3)

    series.data.setAll(timeSeriesFuels.value[key]);
  });

  const legend = chart.children.push(Legend.new(chartRoot, {}));
  legend.data.setAll(chart.series.values);
});

watch(typeTimeSeriesData, () => {
  if (Object.keys(typeTimeSeriesData.value).length === 0) return;

  const chartRoot = Root.new("gen-by-type-chart-daily");
  const chart = chartRoot.container.children.push(XYChart.new(chartRoot, {
    maxTooltipDistance: 0,
    layout: chartRoot.verticalLayout
  }));

  chart.set("cursor", XYCursor.new(chartRoot, {}));

  const xAxis = chart.xAxes.push(DateAxis.new(chartRoot, {
    baseInterval: {
      timeUnit: "minute",
      count: 12
    },
    renderer: AxisRendererX.new(chartRoot, {}),
  }));

  const yAxis = chart.yAxes.push(ValueAxis.new(chartRoot, {
    renderer: AxisRendererY.new(chartRoot, {}),
  }));

  xAxis.get("renderer").labels.template.adapters.add("fill", () => Color.fromString("#ffffff"));
  xAxis.get("renderer").grid.template.adapters.add("stroke", () => Color.fromString("#ffffff"))
  yAxis.get("renderer").labels.template.adapters.add("fill", () => Color.fromString("#ffffff"));
  yAxis.get("renderer").grid.template.adapters.add("stroke", () => Color.fromString("#ffffff"))

  Object.keys(typeTimeSeriesData.value).forEach(key => {
    const fuelColor = Color.fromString(getFuelTypeColor(key as FuelType));

    const series = chart.series.push(LineSeries.new(chartRoot, {
      name: key,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "percent",
      valueXField: "time",
      stroke: fuelColor,
      fill: fuelColor,
      tooltip: Tooltip.new(chartRoot, {
        pointerOrientation: "horizontal",
        labelText: `${key}: {valueY}% {timeStr}`,
      }),
    }));

    series.strokes.template.adapters.add("strokeWidth", () => 3)
    series.data.setAll(typeTimeSeriesData.value[key]);
  });

  const legend = chart.children.push(Legend.new(chartRoot, {}));
  legend.data.setAll(chart.series.values);
});

</script>

<template>
  <div class="grid-box daily-generation-1">
    <RequestLoader :request="dailyGenerationRequest">
      <h2>Generation today by fuel (MW)</h2>
      <div id="gen-by-fuel-chart-daily"></div>
    </RequestLoader>
  </div>
  <div class="grid-box daily-generation-2">
    <RequestLoader :request="dailyGenerationRequest">
      <h2>Generation today by type (%)</h2>
      <div id="gen-by-type-chart-daily"></div>
    </RequestLoader>
  </div>
</template>

<style>
.daily-generation-1 {
  grid-column: 1 / 6;
}

#gen-by-fuel-chart-daily {
  width: 100%;
  height: 600px;
}

.daily-generation-2 {
  grid-column: 6 / 11;
}

#gen-by-type-chart-daily {
  width: 100%;
  height: 535px;
}
</style>