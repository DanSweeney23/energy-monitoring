import { ref, type Ref } from "vue";

export const baseUrl = import.meta.env.VITE_API_URL;

export type ApiRequest<d = any> = {
  data: Ref<d | undefined>
  loading: Ref<boolean>
  error: Ref<boolean>
  doRequest: () => Promise<void>
}

type ResolveFn<d> = (res: Response) => Promise<d>;
function defaultResolver<d>(res: Response): Promise<d> { return res.json() as Promise<d> };

export function useRequest<d = any>(request: () => Promise<Response>, resolve: ResolveFn<d> = defaultResolver<d>): ApiRequest<d> {
  const data = ref<d>();
  const loading = ref(false);
  const error = ref(false);

  const doRequest = async () => {
    loading.value = true;
    data.value = undefined;
    error.value = false;

    try {
      const res = await request();

      loading.value = false;

      if (!res.ok) {
        error.value = true;
        return;
      }

      data.value = await resolve(res);

    } catch (err) {
      console.error(err);
      error.value = true;
    }
  }

  return { loading, data, error, doRequest }
}

