import { useQuery } from "@tanstack/react-query";
import { DispatchTable } from "../components/DispatchTable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@shared/components/ui";
import { api } from "@shared/hooks/useApi";
import { API_ENDPOINTS, QUERY_KEYS } from "@shared/constants/api";
import type { DispatchRecord } from "../components/DispatchTable";

interface DispatchResponse {
    records: DispatchRecord[];
    total: number;
}

async function fetchDispatchHistory(): Promise<DispatchResponse> {
    return api.get<DispatchResponse>(API_ENDPOINTS.DISPATCH);
}

export default function EmailDispatchPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: QUERY_KEYS.dispatch,
        queryFn: fetchDispatchHistory,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>E-Mail Versandhistorie</CardTitle>
                <CardDescription>
                    Übersicht aller versendeten E-Mails
                </CardDescription>
            </CardHeader>
            <CardContent>
                <DispatchTable
                    records={data?.records ?? []}
                    isLoading={isLoading}
                    isError={isError}
                />
            </CardContent>
        </Card>
    );
}