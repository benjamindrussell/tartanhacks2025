interface ActionableMotionsProps {
  motions: string[];
}

export function ActionableMotions({ motions }: ActionableMotionsProps) {
  return (
    <div className="bg-gray-800 p-2 rounded-lg">
      {motions.map((motion, index) => (
        <div key={index} className="text-green-500 mb-2 pl-4 bg-gray-900 py-2 rounded-lg">
          Actionable Motion {index + 1}: {motion}
        </div>
      ))}
    </div>
  );
} 