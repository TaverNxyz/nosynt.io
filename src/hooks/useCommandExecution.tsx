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

      // Execute real API calls based on provider and command
      let apiResult;
      let updatedExecution;

      switch (request.provider.toLowerCase()) {
        case 'hunter.io':
          apiResult = await supabase.functions.invoke('hunter-io', {
            body: {
              email: request.input_data,
              executionId: execution.id,
              command: request.command_category === 'Email Intelligence' ? 'email_verify' : 'domain_search'
            }
          });

          if (apiResult?.error) {
            throw new Error(apiResult.error.message || 'Hunter.io API call failed');
          }

          // Fetch updated execution record
          const { data: hunterExecution, error: hunterFetchError } = await supabase
            .from('command_executions')
            .select()
            .eq('id', execution.id)
            .single();

          if (hunterFetchError || !hunterExecution) {
            throw new Error("Failed to fetch updated execution record");
          }

          updatedExecution = hunterExecution;
          break;

        case 'virustotal':
          let vtCommand = 'domain_reputation';
          if (request.command_name.includes('IP')) vtCommand = 'ip_reputation';
          if (request.command_name.includes('URL')) vtCommand = 'url_scan';
          
          apiResult = await supabase.functions.invoke('virustotal', {
            body: {
              target: request.input_data,
              executionId: execution.id,
              command: vtCommand
            }
          });

          if (apiResult?.error) {
            throw new Error(apiResult.error.message || 'VirusTotal API call failed');
          }

          // Fetch updated execution record
          const { data: vtExecution, error: vtFetchError } = await supabase
            .from('command_executions')
            .select()
            .eq('id', execution.id)
            .single();

          if (vtFetchError || !vtExecution) {
            throw new Error("Failed to fetch updated execution record");
          }

          updatedExecution = vtExecution;
          break;

        default:
          // Fallback for other providers not yet implemented
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockResult = {
            success: true,
            data: {
              command: request.command_name,
              input: request.input_data,
              results: `${request.provider} integration coming soon`,
              timestamp: new Date().toISOString(),
              provider: request.provider
            }
          };

          const { data: mockExecution, error: updateError } = await supabase
            .from('command_executions')
            .update({
              status: 'success',
              output_data: mockResult,
              execution_time_ms: Date.now() - startTime,
              api_cost: 0.10
            })
            .eq('id', execution.id)
            .select()
            .single();

          if (updateError || !mockExecution) {
            throw new Error("Failed to update execution record");
          }

          updatedExecution = mockExecution;
          break;
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