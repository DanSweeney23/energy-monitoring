export type CarbonIntensityResponse = [{
  time: string,
  intensity: number
}];

export type CarbonIntensity = {
  time: Date,
  timestamp: number,
  timeStr: string,
  intensity: number
};

export function parseCarbonIntensityResponse(data: CarbonIntensityResponse): CarbonIntensity[] {
  return data.map(item => {
    const time = new Date(item.time);

    return {
      time,
      timestamp: time.getTime(),
      timeStr: time.toLocaleString(),
      intensity: item.intensity
    }
  })
};