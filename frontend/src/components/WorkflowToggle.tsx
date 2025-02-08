interface WorkflowToggleProps {
  workflowId: string;
  isActive: boolean;
  onToggle: () => void;
}

export function WorkflowToggle({ workflowId, isActive, onToggle }: WorkflowToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={isActive}
        onChange={onToggle}
        className="form-checkbox h-4 w-4 text-green-500 rounded border-gray-300"
      />
      <span className="text-sm text-gray-400">Active</span>
    </label>
  );
} 