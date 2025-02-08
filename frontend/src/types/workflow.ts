export interface Workflow {
  id: string;
  title: string;
  files: number;
}

export interface WorkflowAction {
  description: string;
  urls: string[];
}

export interface WorkflowInProgress {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  actions: WorkflowAction[];
} 