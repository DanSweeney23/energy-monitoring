export type Demand = {
  date: Date,
  timestamp: number,
  timeStr: string,
  demand: number
};

//Convert forecast csv into json
export function parseForecastResponse(forecastCsv: string): Demand[] {
  const rawForecasts = forecastCsv.split('\n').slice(1);

  return rawForecasts.map(item => {
    const values = item.split(',');
    const date = new Date(`${values[2]}Z`)
    return {
      date: date,
      timestamp: date.getTime(),
      timeStr: date.toLocaleString(),
      demand: parseInt(values[3])
    }
  })
}