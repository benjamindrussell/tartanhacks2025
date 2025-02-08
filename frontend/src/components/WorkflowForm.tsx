import { useState } from 'react';

const AVAILABLE_ACTIONS = [
  'leftHandPinch',
  'rightHandPinch',
  'leftArm',
  'rightArm'
] as const;

interface FormData {
  title: string;
  description: string;
  action: string;
  urls: string[];
}

interface WorkflowFormProps {
  onSuccess?: () => void;
}

export function WorkflowForm({ onSuccess }: WorkflowFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    action: AVAILABLE_ACTIONS[0],
    urls: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5050/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        action: AVAILABLE_ACTIONS[0],
        urls: ['']
      });
      
      onSuccess?.();
      alert('Workflow created successfully!');
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow. Please try again.');
    }
  };

  const addUrl = () => {
    setFormData(prev => ({ ...prev, urls: [...prev.urls, ''] }));
  };

  const removeUrl = (urlIndex: number) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, index) => index !== urlIndex)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 bg-gray-800 p-6 rounded-lg">
      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Workflow Title
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          placeholder="Enter workflow description"
          rows={3}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="action" className="block text-sm font-medium mb-2">
          Action
        </label>
        <select
          id="action"
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
          value={formData.action}
          onChange={(e) => setFormData({ ...formData, action: e.target.value })}
        >
          {AVAILABLE_ACTIONS.map((actionType) => (
            <option key={actionType} value={actionType}>
              {actionType}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">URLs</label>
          <button
            type="button"
            className="text-green-500 hover:text-green-400"
            onClick={addUrl}
          >
            + Add URL
          </button>
        </div>
        <div className="space-y-2">
          {formData.urls.map((url, urlIndex) => (
            <div key={urlIndex} className="flex gap-2">
              <input
                type="url"
                required
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => {
                  const newUrls = [...formData.urls];
                  newUrls[urlIndex] = e.target.value;
                  setFormData({ ...formData, urls: newUrls });
                }}
              />
              <button
                type="button"
                className="text-red-500 hover:text-red-400 px-2"
                onClick={() => removeUrl(urlIndex)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
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