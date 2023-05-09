import type { Demand } from "@/api/models/demandForecastModels";
import { Root, Color, Tooltip } from "@amcharts/amcharts5";
import { XYChart, LineSeries, DateAxis, ValueAxis, AxisRendererX, AxisRendererY, XYCursor } from "@amcharts/amcharts5/xy";

export function makeDemandGraph(chartId: string, data: Demand[], trendLine: boolean, seriesColor: string = '#d13615') {
  const chartRoot = Root.new(chartId);
  const chart = chartRoot.container.children.push(XYChart.new(chartRoot, {
    maxTooltipDistance: 1000,
  }));

  const lastTime = data.map(item => item.date).sort()[data.length - 1];
  const graphEndTime = new Date(lastTime.toISOString().split('T')[0] + 'T23:59:59Z')

  const xAxis = chart.xAxes.push(DateAxis.new(chartRoot, {
    baseInterval: {
      timeUnit: "minute",
      count: 12
    },
    max: graphEndTime.getTime(),
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


  const color = Color.fromString(seriesColor);

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

  series.strokes.template.adapters.add("strokeWidth", () => 3)

  series.data.setAll(data);

  if (trendLine) {
    const trendFn = calculateTrendLineFunction(data.filter(item => !Number.isNaN(item.timestamp)));

    const timestamps = data.map(item => item.timestamp).filter(item => !Number.isNaN(item));

    const firstTimestamp = Math.min(...timestamps);
    const lastTimestamp = Math.max(...timestamps);

    const trendData = [
      { x: firstTimestamp, y: trendFn(firstTimestamp) },
      { x: lastTimestamp, y: trendFn(lastTimestamp) }
    ];

    const trendSeries = LineSeries.new(chartRoot, {
      xAxis: xAxis,
      yAxis: yAxis,
      valueXField: "x",
      stroke: Color.fromString("#fff"),
      valueYField: "y"
    });

    trendSeries.data.setAll(trendData);
    trendSeries.appear(1000, 100);
    chart.series.push(trendSeries);
  }

  chart.set("cursor", XYCursor.new(chartRoot, { snapToSeries: [series] }));
}


function calculateTrendLineFunction(data: Demand[]) {
  const sumX = data.reduce((total, item) => total + item.timestamp, 0);
  const sumY = data.reduce((total, item) => total + item.demand, 0);

  const meanX = sumX / data.length;
  const meanY = sumY / data.length;

  const deviancies = data.map((item) => {
    const xDeviance = (item.timestamp - meanX);
    const yDeviance = (item.demand - meanY)
    return [xDeviance * yDeviance, xDeviance * xDeviance];
  });

  const slope = deviancies.reduce((t, i) => t + i[0], 0) / deviancies.reduce((t, i) => t + i[1], 0);

  const yIntercept = meanY - (slope * meanX);

  return (xVal: number) => (slope * xVal) + yIntercept;
}