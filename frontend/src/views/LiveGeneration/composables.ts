import { baseUrl, useRequest } from "@/api/config";
import type { LiveGenerationData } from "./models";

const liveGenerationRequest = useRequest<LiveGenerationData>(() => fetch(`${baseUrl}/generation/live`));

export function useLiveGenerationRequest(invoke: boolean = false) {
  if(invoke) {
    liveGenerationRequest.doRequest();
  }

  return liveGenerationRequest;
}
