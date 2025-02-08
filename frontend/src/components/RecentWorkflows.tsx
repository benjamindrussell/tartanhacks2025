interface Workflow {
  id: string;
  title: string;
  files: number;
}

interface RecentWorkflowsProps {
  workflows: Workflow[];
}

export function RecentWorkflows({ workflows }: RecentWorkflowsProps) {
  return (
    <div className="mt-8 bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Recent Workflows</h2>
        <button className="text-gray-400 hover:text-white flex items-center gap-2">
          Show All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-gray-900 p-6 rounded-lg hover:bg-gray-800 transition-colors">
            <div className="flex items-start mb-4">
              <div className="w-8 h-8 bg-green-800 rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
            </div>
            <h3 className="font-medium mb-2">{workflow.title}</h3>
            <p className="text-gray-500 text-sm">{workflow.files} files</p>
          </div>
        ))}
      </div>
    </div>
  );
} 