export interface Workflow {
  id: string;
  title: string;
  files?: number;
  active?: boolean;
}

export interface WorkflowInProgress {
  _id: string;
  title: string;
  description: string;
  action: string;
  urls: string[];
  active: boolean;
  createdAt: string;
} 