export interface Workflow {
  id: string;
  title: string;
  files: number;
}

export interface WorkflowInProgress {
  _id: string;
  title: string;
  description: string;
  action: string;
  urls: string[];
  createdAt: string;
} 