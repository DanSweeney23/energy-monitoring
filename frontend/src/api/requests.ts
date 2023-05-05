import { baseUrl, useRequest } from "@/api/config";
import type { LiveGenerationData } from "@/api/models/generationModels";
import type { CarbonIntensityResponse } from "./models/carbonModels";

const liveGenerationRequest = useRequest<LiveGenerationData>(() => fetch(`${baseUrl}/generation/live`));
export function useLiveGenerationRequest(invoke: boolean = false) {
  if (invoke) liveGenerationRequest.doRequest();

  return liveGenerationRequest;
}

const dailyGenerationRequest = useRequest<LiveGenerationData[]>(() => fetch(`${baseUrl}/generation/daily`));
export function useDailyGenerationRequest(invoke: boolean = false) {
  if (invoke) dailyGenerationRequest.doRequest();

  return dailyGenerationRequest;
}

const demandForecastRequest = useRequest<string>(() => fetch(`${baseUrl}/demandforecast/latest`), (res => res.text()));
export function useDemandForecastRequest(invoke: boolean = false) {
  if (invoke) demandForecastRequest.doRequest();

  return demandForecastRequest;
}

const carbonIntensityRequest = useRequest<CarbonIntensityResponse>(() => fetch(`${baseUrl}/carbonintensity/latest`));
export function useCarbonIntensityForecastRequest(invoke: boolean = false) {
  if(invoke) carbonIntensityRequest.doRequest();

  return carbonIntensityRequest;
}