import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { RecentWorkflows } from '../components/RecentWorkflows'
import { WorkflowsInProgress } from '../components/WorkflowsInProgress'
import type { Workflow, WorkflowInProgress } from '../types/workflow'
import { WorkflowForm } from '../components/WorkflowForm'

export function Home() {
  const [workflowsInProgress, setWorkflowsInProgress] = useState<WorkflowInProgress[]>([])
  const [recentWorkflows, setRecentWorkflows] = useState<Workflow[]>([])
  
  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:5050/api/workflows');
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      
      // Map server data to our interfaces
      const formattedWorkflows = data.map((workflow: any) => ({
        id: workflow._id,
        title: workflow.title,
        description: workflow.description,
        active: workflow.active,
        createdAt: new Date(workflow.createdAt).toLocaleString()
      }));

      // Split workflows into active and all
      setWorkflowsInProgress(data.filter((w: any) => w.active));
      setRecentWorkflows(formattedWorkflows);  // Show all workflows in recent
    } catch (error) {
      console.error('Error fetching workflows:', error);
    }
  };

  const handleToggleActive = async (workflowId: string) => {
    try {
      const response = await fetch(`http://localhost:5050/api/workflows/${workflowId}/toggle-active`, {
        method: 'PATCH'
      });
      if (!response.ok) throw new Error('Failed to toggle workflow status');
      fetchWorkflows(); // Refresh both lists
    } catch (error) {
      console.error('Error toggling workflow status:', error);
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

          <WorkflowForm onSuccess={fetchWorkflows} />

          <RecentWorkflows 
            workflows={recentWorkflows} 
            onToggleActive={handleToggleActive} 
          />
        </div>

        {/* Workflows in Progress column */}
        <WorkflowsInProgress workflows={workflowsInProgress} />
      </div>
    </div>
  )
} 