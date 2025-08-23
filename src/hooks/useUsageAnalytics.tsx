import { useState, useEffect } from "react";
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
  const [limits, setLimits] = useState<UserLimits | null>({
    within_command_limit: true,
    within_cost_limit: true,
    current_commands: 0,
    max_commands: 100,
    current_cost: 0,
    max_cost: 50.00
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // For now, just set loading to false and use mock data
      setLoading(false);
    }
  }, [user]);

  const fetchUsageData = async () => {
    // Mock implementation for now
    setLoading(false);
  };

  const fetchUserLimits = async () => {
    // Mock implementation for now
    setLoading(false);
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