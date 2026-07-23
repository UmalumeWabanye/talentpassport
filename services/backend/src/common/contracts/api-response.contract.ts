export interface ApiResponseMeta {
  timestamp: string;
  path?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  statusCode: number;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  meta: ApiResponseMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;