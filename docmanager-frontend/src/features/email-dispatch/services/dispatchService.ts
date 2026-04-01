import { api } from "@shared/hooks/useApi";
import { API_ENDPOINTS } from "@shared/constants/api";
import type { DispatchRecord } from "../components/DispatchTable";

interface DispatchResponse {
    records: DispatchRecord[];
    total: number;
}

export async function fetchDispatchHistory(): Promise<DispatchResponse> {
    return api.get<DispatchResponse>(API_ENDPOINTS.DISPATCH);
}