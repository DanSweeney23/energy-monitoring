import { baseUrl, useRequest } from "@/api/config";
import type { LiveGenerationData } from "@/api/models/generationModels";

const dailyGenerationRequest = useRequest<LiveGenerationData[]>(() => fetch(`${baseUrl}/generation/daily`));

export function useDailyGenerationRequest(invoke: boolean = false) {
  if(invoke) {
    dailyGenerationRequest.doRequest();
  }

  return dailyGenerationRequest;
}
