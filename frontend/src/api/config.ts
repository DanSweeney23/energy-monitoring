import { ref, type Ref } from "vue";

export const baseUrl = 'https://zkqqz25fm1.execute-api.eu-west-2.amazonaws.com/prod';

export type ApiRequest<d = any> = {
  data: Ref<d>
  loading: Ref<boolean>
  error: Ref<boolean>
  doRequest: () => Promise<void>
}

export function useRequest<d = any>(request: Promise<Response>): ApiRequest {
  const data = ref<d>();
  const loading = ref(false);
  const error = ref(false);

  const doRequest = async () => {
    loading.value = true;
    data.value = undefined;
    error.value = false;

    try {
      const res = await request;

      loading.value = false;

      if (!res.ok) {
        error.value = true
        return;
      }

      data.value = await res.json() as d;

    } catch (err) {
      error.value = true
    }
  }

  return { loading, data, error, doRequest }
}

