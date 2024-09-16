import { AxiosRequestConfig } from "axios";
import service from "@/utils/request";

type CustomAxiosRequestConfig = AxiosRequestConfig & {
  isLoading?: boolean;
};
const postApi = (url: string, data: any = {}, config = {}): any =>
  service.post(url, data, {
    isLoading: true,
    ...config,
  } as CustomAxiosRequestConfig);

const postApiWithoutLoading = (url: string, data: any = {}, config = {}): any =>
  service.post(url, data, {
    isLoading: false,
    ...config,
  } as CustomAxiosRequestConfig);

const getApi = (url: string, params: any = {}, config = {}): any =>
  service.get(url, {
    params,
    isLoading: true,
    ...config,
  } as CustomAxiosRequestConfig);

const getApiWithoutLoading = (
  url: string,
  params: any = {},
  config = {}
): any =>
  service.get(url, {
    params,
    isLoading: false,
    ...config,
  } as CustomAxiosRequestConfig);

export { postApi, postApiWithoutLoading, getApi, getApiWithoutLoading };
