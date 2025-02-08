import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { RecentWorkflows } from '../components/RecentWorkflows'
import { WorkflowsInProgress } from '../components/WorkflowsInProgress'
import type { Workflow, WorkflowInProgress } from '../types/workflow'
import { WorkflowForm } from '../components/WorkflowForm'

export function Home() {
  const [workflowsInProgress, setWorkflowsInProgress] = useState<WorkflowInProgress[]>([])
  
  const recentWorkflows: Workflow[] = [
    { id: '1', title: 'Geology Paper Workflow', files: 24 },
    { id: '2', title: 'Coding assignment workflow', files: 102 },
    { id: '3', title: 'Email Response Workflow', files: 84 },
    { id: '4', title: 'Personal Media', files: 45 },
    { id: '5', title: 'Reddingo Backup', files: 32 },
    { id: '6', title: 'Root', files: 105 },
  ]

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/workflows');
      console.log(response);
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setWorkflowsInProgress(data.map((workflow: any) => ({
        ...workflow,
        createdAt: new Date(workflow.createdAt).toLocaleString()
      })));
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  return (
    <div className="p-8">
      <div className="flex gap-8">
        {/* Main content column */}
        <div className="flex-1">
          <Header />
          {/* <p className="text-gray-400 mb-4">Create actionable tasks through a simple sentence</p> */}
          {/* <SearchBar value={searchText} onChange={setSearchText} /> */}
          {/* <ActionableMotions motions={actionableMotions} /> */}

          <WorkflowForm onSuccess={() => {
            fetchWorkflows(); // Refresh workflows after adding new one
          }} />

          <RecentWorkflows workflows={recentWorkflows} />
        </div>

        {/* Workflows in Progress column */}
        <WorkflowsInProgress workflows={workflowsInProgress} />
      </div>
    </div>
  )
} 