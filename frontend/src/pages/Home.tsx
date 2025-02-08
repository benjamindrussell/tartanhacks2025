import { useState } from 'react'
import { Header } from '../components/Header'
import { SearchBar } from '../components/SearchBar'
import { ActionableMotions } from '../components/ActionableMotions'
import { RecentWorkflows } from '../components/RecentWorkflows'
import { WorkflowsInProgress } from '../components/WorkflowsInProgress'
import type { Workflow, WorkflowInProgress } from '../types/workflow'
import { WorkflowForm } from '../components/WorkflowForm'

export function Home() {
  const [searchText, setSearchText] = useState('')
  const [workflowsInProgress, setWorkflowsInProgress] = useState<WorkflowInProgress[]>([])
  
  const recentWorkflows: Workflow[] = [
    { id: '1', title: 'Geology Paper Workflow', files: 24 },
    { id: '2', title: 'Coding assignment workflow', files: 102 },
    { id: '3', title: 'Email Response Workflow', files: 84 },
    { id: '4', title: 'Personal Media', files: 45 },
    { id: '5', title: 'Reddingo Backup', files: 32 },
    { id: '6', title: 'Root', files: 105 },
  ]

  const actionableMotions = [
    'Close Fist',
    'Index Finger and Thumb together',
    'Third Finger and Thumb together',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newWorkflow: WorkflowInProgress = {
      id: crypto.randomUUID(),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      createdAt: new Date().toLocaleString(),
      actions: [], // You'll need to implement action collection from the form
    };

    setWorkflowsInProgress(prev => [...prev, newWorkflow]);
    form.reset();
  };

  return (
    <div className="p-8">
      <div className="flex gap-8">
        {/* Main content column */}
        <div className="flex-1">
          <Header />
          {/* <p className="text-gray-400 mb-4">Create actionable tasks through a simple sentence</p> */}
          {/* <SearchBar value={searchText} onChange={setSearchText} /> */}
          {/* <ActionableMotions motions={actionableMotions} /> */}

          <WorkflowForm onSubmit={handleSubmit} />

          <RecentWorkflows workflows={recentWorkflows} />
        </div>

        {/* Workflows in Progress column */}
        <WorkflowsInProgress workflows={workflowsInProgress} />
      </div>
    </div>
  )
} 