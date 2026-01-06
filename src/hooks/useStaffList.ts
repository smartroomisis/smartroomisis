import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
}

export function useStaffList() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all users with 'staff' role from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "staff");

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        setStaffList([]);
        return;
      }

      const staffUserIds = roleData.map((r) => r.user_id);

      // Get profiles for these users
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", staffUserIds);

      if (profileError) throw profileError;

      const staff: StaffMember[] = (profileData || []).map((p) => ({
        id: p.id,
        name: p.full_name || p.email,
        email: p.email,
      }));

      setStaffList(staff);
    } catch (err) {
      console.error("Error fetching staff list:", err);
      setError("Erro ao carregar lista de colaboradores");
    } finally {
      setLoading(false);
    }
  };

  return { staffList, loading, error, refetch: fetchStaffMembers };
}