import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface CommandResult {
  id: string;
  command_name: string;
  command_category: string;
  provider: string;
  status: 'pending' | 'success' | 'error';
  input_data: string;
  output_data?: any;
  error_message?: string;
  execution_time_ms?: number;
  api_cost?: number;
  created_at: string;
}

export interface CommandRequest {
  command_name: string;
  command_category: string;
  provider: string;
  input_data: string;
  parameters?: Record<string, any>;
}

export function useCommandExecution() {
  const { user } = useAuth();
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<CommandResult[]>([]);

  const executeCommand = async (request: CommandRequest): Promise<CommandResult | null> => {
    if (!user) {
      toast.error("Please sign in to execute commands");
      return null;
    }

    setExecuting(true);
    const startTime = Date.now();

    try {
      // Check user limits first
      const { data: limitsData } = await supabase.rpc('check_user_limits', {
        user_uuid: user.id,
        api_cost_to_add: 0.50 // Default cost estimate
      });

      if (limitsData?.[0] && (!limitsData[0].within_command_limit || !limitsData[0].within_cost_limit)) {
        toast.error("Command limit reached. Please upgrade your plan.");
        return null;
      }

      // Create execution record
      const { data: execution, error: insertError } = await supabase
        .from('command_executions')
        .insert({
          user_id: user.id,
          command_id: `${request.command_category}_${request.command_name}`.toLowerCase().replace(/\s+/g, '_'),
          command_name: request.command_name,
          command_category: request.command_category,
          provider: request.provider,
          input_data: request.input_data,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError || !execution) {
        console.error('Insert error:', insertError);
        throw new Error("Failed to create execution record");
      }

      // Simulate command execution (replace with actual API calls)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const executionTime = Date.now() - startTime;
      const mockResult = {
        success: true,
        data: {
          command: request.command_name,
          input: request.input_data,
          results: `Mock results for ${request.command_name}`,
          timestamp: new Date().toISOString(),
          provider: request.provider
        }
      };

      // Update execution with results
      const { data: updatedExecution, error: updateError } = await supabase
        .from('command_executions')
        .update({
          status: 'success',
          output_data: mockResult,
          execution_time_ms: executionTime,
          api_cost: 0.50
        })
        .eq('id', execution.id)
        .select()
        .single();

      if (updateError) {
        throw new Error("Failed to update execution record");
      }

      const result: CommandResult = {
        id: updatedExecution.id,
        command_name: updatedExecution.command_name,
        command_category: updatedExecution.command_category,
        provider: updatedExecution.provider,
        status: updatedExecution.status as 'success',
        input_data: updatedExecution.input_data,
        output_data: updatedExecution.output_data,
        execution_time_ms: updatedExecution.execution_time_ms,
        api_cost: updatedExecution.api_cost,
        created_at: updatedExecution.created_at
      };

      setResults(prev => [result, ...prev]);
      toast.success(`Command ${request.command_name} executed successfully`);
      
      return result;

    } catch (error) {
      console.error('Command execution failed:', error);
      toast.error(`Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return null;
    } finally {
      setExecuting(false);
    }
  };

  const getRecentResults = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('command_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setResults((data || []).map(execution => ({
        id: execution.id,
        command_name: execution.command_name,
        command_category: execution.command_category,
        provider: execution.provider,
        status: execution.status as 'pending' | 'success' | 'error',
        input_data: execution.input_data,
        output_data: execution.output_data,
        error_message: execution.error_message,
        execution_time_ms: execution.execution_time_ms,
        api_cost: execution.api_cost,
        created_at: execution.created_at
      })));
    } catch (error) {
      console.error('Failed to fetch results:', error);
    }
  };

  return {
    executeCommand,
    getRecentResults,
    executing,
    results
  };
}