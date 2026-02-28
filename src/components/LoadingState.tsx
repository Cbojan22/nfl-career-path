interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading players...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="w-10 h-10 border-3 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}
