import { useState } from 'react';

const AVAILABLE_ACTIONS = [
  'leftHandPinch',
  'rightHandPinch',
  'leftArm',
  'rightArm'
] as const;

interface WorkflowFormProps {
  onSubmit: (e: React.FormEvent) => void;
}

export function WorkflowForm({ onSubmit }: WorkflowFormProps) {
  const [actions, setActions] = useState<{ description: string; urls: string[] }[]>([
    { description: AVAILABLE_ACTIONS[0], urls: [] }
  ]);

  const addAction = () => {
    setActions(prev => [...prev, { description: AVAILABLE_ACTIONS[0], urls: [] }]);
  };

  const addUrl = (actionIndex: number) => {
    setActions(prev => {
      const newActions = [...prev];
      newActions[actionIndex].urls = [...newActions[actionIndex].urls, ''];
      return newActions;
    });
  };

  const removeUrl = (actionIndex: number, urlIndex: number) => {
    setActions(prev => {
      const newActions = [...prev];
      newActions[actionIndex].urls.splice(urlIndex, 1);
      return newActions;
    });
  };

  return (
    <form onSubmit={onSubmit} className="mb-8 bg-gray-800 p-6 rounded-lg">
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Workflow Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          placeholder="Enter workflow title"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          placeholder="Enter workflow description"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        {actions.map((action, actionIndex) => (
          <div key={actionIndex} className="bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">
                Action {actionIndex + 1}
              </label>
              <button
                type="button"
                className="text-green-500 hover:text-green-400"
                onClick={addAction}
              >
                + Add Action
              </button>
            </div>
            
            <select
              name={`action-${actionIndex}-description`}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4"
              value={action.description}
              onChange={(e) => {
                const newActions = [...actions];
                newActions[actionIndex].description = e.target.value;
                setActions(newActions);
              }}
            >
              {AVAILABLE_ACTIONS.map((actionType) => (
                <option key={actionType} value={actionType}>
                  {actionType}
                </option>
              ))}
            </select>

            <div className="space-y-2">
              {action.urls.map((url, urlIndex) => (
                <div key={urlIndex} className="flex gap-2">
                  <input
                    type="url"
                    name={`action-${actionIndex}-url-${urlIndex}`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    placeholder="Enter URL"
                    value={url}
                    onChange={(e) => {
                      const newActions = [...actions];
                      newActions[actionIndex].urls[urlIndex] = e.target.value;
                      setActions(newActions);
                    }}
                  />
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-400 px-2"
                    onClick={() => removeUrl(actionIndex, urlIndex)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-blue-500 hover:text-blue-400 text-sm"
                onClick={() => addUrl(actionIndex)}
              >
                + Add URL
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          Create Workflow
        </button>
      </div>
    </form>
  );
} 