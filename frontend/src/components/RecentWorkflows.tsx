import { WorkflowToggle } from './WorkflowToggle';
import type { Workflow } from '../types/workflow';

interface RecentWorkflowsProps {
  workflows: Workflow[];
  onToggleActive?: (workflowId: string) => Promise<void>;
}

export function RecentWorkflows({ workflows, onToggleActive }: RecentWorkflowsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Recent Workflows</h2>
      <div className="grid grid-cols-2 gap-4">
        {workflows.length > 0 ? (
          workflows.map((workflow) => (
            <div key={workflow.id} className="flex flex-col p-4 bg-gray-800 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-2">{workflow.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{workflow.description}</p>
              </div>
              <div className="flex justify-end mt-auto pt-3 border-t border-gray-700">
                <WorkflowToggle
                  workflowId={workflow.id}
                  isActive={workflow.active || false}
                  onToggle={() => onToggleActive?.(workflow.id)}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 col-span-2">No workflows created yet</div>
        )}
      </div>
    </div>
  );
} 