'use client'

import { GoogleSheetResponse, GoogleSheetUrlResponse, ApiResponse, ApiError } from '@/app/type'

// API 路由定義
const API_ROUTES = {
  GOOGLE_SHEET: {
    GET_DATA: '/api/google-sheet',
    GET_URL: '/api/google-sheet/url',
  },
} as const

// API 方法定義
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

// API 配置介面
interface ApiConfig {
  baseUrl?: string
  headers?: Record<string, string>
}

// API 請求選項介面
interface RequestOptions<TBody = unknown> extends Omit<RequestInit, 'body'> {
  params?: Record<string, string>
  body?: TBody
}

/**
 * 建立 API 請求客戶端
 */
function createApiClient(config: ApiConfig = {}) {
  const baseUrl = config.baseUrl ?? ''
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...config.headers,
  }

  /**
   * 發送 API 請求
   */
  async function request<TResponse extends ApiResponse<unknown>, TBody = unknown>(
    method: HttpMethod,
    url: string,
    options: RequestOptions<TBody> = {}
  ): Promise<NonNullable<TResponse['data']>> {
    const { params, body, headers, ...restOptions } = options

    // 處理 URL 參數
    const queryParams = params ? new URLSearchParams(params).toString() : ''
    const fullUrl = `${baseUrl}${url}${queryParams ? `?${queryParams}` : ''}`

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        ...restOptions,
      })

      const data: TResponse = await response.json()

      if (!response.ok || data.error) {
        throw new ApiError(data.error?.message ?? 'API request failed')
      }

      if (!data.data) {
        throw new ApiError('No data received from API')
      }

      return data.data as NonNullable<TResponse['data']>
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error occurred')
    }
  }

  return {
    get: <TResponse extends ApiResponse<unknown>>(
      url: string,
      options?: Omit<RequestOptions, 'body'>
    ) => request<TResponse>('GET', url, options),

    post: <TResponse extends ApiResponse<unknown>, TBody = unknown>(
      url: string,
      options?: RequestOptions<TBody>
    ) => request<TResponse, TBody>('POST', url, options),

    put: <TResponse extends ApiResponse<unknown>, TBody = unknown>(
      url: string,
      options?: RequestOptions<TBody>
    ) => request<TResponse, TBody>('PUT', url, options),

    delete: <TResponse extends ApiResponse<unknown>>(
      url: string,
      options?: Omit<RequestOptions, 'body'>
    ) => request<TResponse>('DELETE', url, options),
  }
}

// 建立 API 客戶端實例
const apiClient = createApiClient()

/**
 * Google Sheet API
 */
export const googleSheetApi = {
  /**
   * 獲取 Google Sheet 數據
   */
  getData: () => {
    return apiClient.get<GoogleSheetResponse>(API_ROUTES.GOOGLE_SHEET.GET_DATA)
  },

  /**
   * 獲取 Google Sheet URL
   */
  getUrl: () => {
    return apiClient.get<GoogleSheetUrlResponse>(API_ROUTES.GOOGLE_SHEET.GET_URL)
  },
}
