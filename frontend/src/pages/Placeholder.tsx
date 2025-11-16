interface PlaceholderProps {
  title: string;
  description: string;
}

const Placeholder = ({ title, description }: PlaceholderProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Under Development</h2>
        <p className="text-gray-600">This feature is coming soon!</p>
      </div>
    </div>
  );
};

export default Placeholder;
