import type { WorkflowInProgress } from '../types/workflow';

interface WorkflowsInProgressProps {
  workflows: WorkflowInProgress[];
}

export function WorkflowsInProgress({ workflows }: WorkflowsInProgressProps) {
  return (
    <div className="w-80 bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Workflows in Progress</h2>
      {workflows.map((workflow) => (
        <div key={workflow.id} className="bg-gray-900 p-4 rounded-lg mb-4">
          <h3 className="font-medium mb-2">{workflow.title}</h3>
          <p className="text-gray-500 text-sm mb-4">{workflow.description}</p>
          
          {workflow.actions.map((action, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="text-sm font-medium text-gray-400 mb-2">
                Action {index + 1}
              </div>
              <p className="text-sm mb-2">{action.description}</p>
              {action.urls.length > 0 && (
                <div className="space-y-1">
                  {action.urls.map((url, urlIndex) => (
                    <a
                      key={urlIndex}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm block truncate"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="text-xs text-gray-500 mt-4">
            Created {workflow.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
} 