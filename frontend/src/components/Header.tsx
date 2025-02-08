export function Header() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-4xl font-bold">WORKFLOWS</h1>
      <div className="flex gap-4">
        <button className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          + Create New Workflow
        </button>
        <button className="border border-green-500 text-green-500 hover:bg-green-900 px-4 py-2 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload
        </button>
      </div>
    </div>
  );
} 