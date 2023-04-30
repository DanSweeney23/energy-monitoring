import { baseUrl, useRequest } from "@/api/config";

type LiveGenerationData = {
  date: {
    N: string
  },
  time: {
    N: string
  },
  fuels: {
    L: Array<{
      M: {
        fuelType: {
          S: string
        },
        value: {
          N: string
        },
        percent: {
          N: string
        }
      }
    }>
  }
};

const liveGenerationRequest = useRequest<LiveGenerationData>(fetch(`${baseUrl}/generation/live`));

export function useLiveGenerationRequest(invoke: boolean = false) {
  if(invoke) {
    liveGenerationRequest.doRequest();
  }

  return liveGenerationRequest;
}