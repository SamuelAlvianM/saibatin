import { NextResponse } from "next/server";

/**
 * Format respons seragam — mengikuti kontrak Laravel lama:
 * { error: string[], success: string[], data: any, html: any }
 * Supaya frontend (Redux thunk) kompatibel tanpa perubahan besar.
 */
export interface ApiResult<T = unknown> {
  error: string[];
  success: string[];
  data: T | null;
  html?: unknown;
}

export function ok<T>(data: T, success: string[] = [], init?: ResponseInit) {
  return NextResponse.json<ApiResult<T>>(
    { error: [], success, data, html: [] },
    init
  );
}

export function fail(error: string[], status = 400) {
  return NextResponse.json<ApiResult>(
    { error, success: [], data: null, html: [] },
    { status }
  );
}
