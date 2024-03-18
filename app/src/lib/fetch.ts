import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_BASEPATH;

axios.defaults.withCredentials = true;

async function axiosWithRetry(fn: () => Promise<AxiosResponse>): Promise<AxiosResponse> {
  try{
    const response = await fn();
    return response;
  } catch(err){
    if(err instanceof AxiosError){
      if (err.response?.status === 503 && err.response.headers["Retry-After"]) {
        let retryAfter = parseInt(err.response.headers["Retry-After"]);
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        return axiosWithRetry(fn);
      }
    }
    throw err;
  }
}

export async function get(url: string, config?: AxiosRequestConfig) {
  return axiosWithRetry(() => axios.get(url, config));
}

export function del(url: string, config?: AxiosRequestConfig) {
  return axiosWithRetry(() => axios.delete(url, config));
}

export function post(url: string, data: any, config?: AxiosRequestConfig) {
  return axiosWithRetry(() => axios.post(url, data, config));
}

export function patch(url: string, data: any, config?: AxiosRequestConfig) {
  return axiosWithRetry(() => axios.patch(url, data, config));
}

export function put(url: string, data: any, config?: AxiosRequestConfig) {
  return axiosWithRetry(() => axios.put(url, data, config));
}

export const fetchWithRetries = async (url: string, options: RequestInit, retries = 1): Promise<Response> => {
  try {
    return await fetch(url, options);
  } catch (err) {
    if (retries <= 3) {
      const delay = Math.min(Math.pow(2, retries) / 4 + Math.random(), 4) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
      console.log(`Request failed, retrying ${retries}/3. Error ${err}`);
      return fetchWithRetries(url, options, retries + 1);
    } else {
      throw new Error(`Max retries exceeded. error: ${err}`);
    }
  }
};

//https://stackoverflow.com/questions/76264542/can-axios-be-used-in-new-next-js-13-instead-of-extended-next-fetch-api-version