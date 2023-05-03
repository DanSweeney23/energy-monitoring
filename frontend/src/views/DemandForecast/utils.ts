import type { Forecast } from "@/api/models/forecastModels";
import { Root, Color, Tooltip } from "@amcharts/amcharts5";
import { XYChart, LineSeries, DateAxis, ValueAxis, AxisRendererX, AxisRendererY, XYCursor } from "@amcharts/amcharts5/xy";

export function makeDemandGraph(chartId: string, data: Forecast[]) {
  const chartRoot = Root.new(chartId);
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
    name: "Demand",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "demand",
    valueXField: "timestamp",
    stroke: color,
    fill: color,
    tooltip: Tooltip.new(chartRoot, {
      pointerOrientation: "horizontal",
      labelText: `{timeStr}\n\n Demand: {valueY} MW`,
    }),
  }));

  chart.set("cursor", XYCursor.new(chartRoot, { snapToSeries: [series] }));

  series.strokes.template.adapters.add("strokeWidth", () => 3)

  series.data.setAll(data);

}