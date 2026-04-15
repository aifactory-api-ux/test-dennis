declare module 'axios' {
  export interface AxiosRequestConfig {
    baseURL?: string;
    headers?: Record<string, string>;
  }

  export interface AxiosResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: AxiosRequestConfig;
  }

  export default class Axios {
    constructor(config?: AxiosRequestConfig);
    get<T>(url: string): Promise<AxiosResponse<T>>;
    post<T>(url: string, data?: unknown): Promise<AxiosResponse<T>>;
    put<T>(url: string, data?: unknown): Promise<AxiosResponse<T>>;
    delete<T>(url: string): Promise<AxiosResponse<T>>;
  }

  // Static methods
  export function get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}
