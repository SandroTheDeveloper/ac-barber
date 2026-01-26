import { useState, useEffect, useCallback } from "react";
import { getFullDatesFromSupabase } from "../api";

export function useFullDates() {
    const [fullDates, setFullDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshFullDates = useCallback(async () => {
        setLoading(true);
        const dates = await getFullDatesFromSupabase();
        setFullDates(dates);
        setLoading(false);
    }, []);

    useEffect(() => {
        refreshFullDates();
    }, [refreshFullDates]);

    return {
        fullDates,
        loadingFullDates: loading,
        refreshFullDates,
    };
}