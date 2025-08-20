import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UsageData {
  total_commands: number;
  successful_commands: number;
  failed_commands: number;
  total_api_cost: number;
  categories_used: string[];
  providers_used: string[];
}

interface UserLimits {
  within_command_limit: boolean;
  within_cost_limit: boolean;
  current_commands: number;
  max_commands: number;
  current_cost: number;
  max_cost: number;
}

export function useUsageAnalytics() {
  const { user } = useAuth();
  const [monthlyUsage, setMonthlyUsage] = useState<UsageData>({
    total_commands: 0,
    successful_commands: 0,
    failed_commands: 0,
    total_api_cost: 0,
    categories_used: [],
    providers_used: []
  });
  const [limits, setLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsageData();
      fetchUserLimits();
    }
  }, [user]);

  const fetchUsageData = async () => {
    if (!user) return;

    try {
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const { data, error } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay.toISOString().split('T')[0]);

      if (error) throw error;

      const aggregated = data?.reduce((acc, day) => ({
        total_commands: acc.total_commands + (day.total_commands || 0),
        successful_commands: acc.successful_commands + (day.successful_commands || 0),
        failed_commands: acc.failed_commands + (day.failed_commands || 0),
        total_api_cost: acc.total_api_cost + (day.total_api_cost || 0),
        categories_used: [...new Set([...acc.categories_used, ...(Array.isArray(day.categories_used) ? day.categories_used : [])])],
        providers_used: [...new Set([...acc.providers_used, ...(Array.isArray(day.providers_used) ? day.providers_used : [])])]
      }), {
        total_commands: 0,
        successful_commands: 0,
        failed_commands: 0,
        total_api_cost: 0,
        categories_used: [],
        providers_used: []
      }) || monthlyUsage;

      setMonthlyUsage(aggregated);
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    }
  };

  const fetchUserLimits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('check_user_limits', { 
        user_uuid: user.id 
      });

      if (error) throw error;
      if (data && data.length > 0) {
        setLimits(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch user limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchUsageData(), fetchUserLimits()]);
  };

  return {
    monthlyUsage,
    limits,
    loading,
    refreshData
  };
}