import { useQuery } from "@tanstack/react-query";
import { fetchDispatchHistory } from "../services/dispatchService";

export function useDispatchHistory() {
    return useQuery({
        queryKey: ["dispatch-history"],
        queryFn: fetchDispatchHistory,
    });
}