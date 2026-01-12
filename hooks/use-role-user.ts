import { supabase } from "@/app/services/supabase";
import { useEffect, useState } from "react";

export function useUserRole() {
  const [role, setRole] = useState<"ADMIN" | "CLIENT" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        setRole(null);
        setLoading(false);
        return;
      }

      const userId = sessionData.session.user.id;

      const { data, error } = await supabase
        .from("clients")
        .select("role")
        .eq("id", userId)
        .single();

      if (!error && data?.role) {
        setRole(data.role);
      }

      setLoading(false);
    };

    loadRole();
  }, []);

  return { role, loading };
}