import type { SearchResult } from '../../api/types';

interface AutocompleteDropdownProps {
  results: SearchResult[];
  highlightIndex: number;
  onSelect: (result: SearchResult) => void;
}

export function AutocompleteDropdown({
  results,
  highlightIndex,
  onSelect,
}: AutocompleteDropdownProps) {
  if (results.length === 0) return null;

  return (
    <ul
      className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto"
      role="listbox"
    >
      {results.map((result, i) => (
        <li
          key={result.id}
          role="option"
          aria-selected={i === highlightIndex}
          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
            i === highlightIndex
              ? 'bg-blue-600/40 text-white'
              : 'text-gray-200 hover:bg-gray-700'
          }`}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent input blur
            onSelect(result);
          }}
        >
          <img
            src={result.headshotUrl}
            alt=""
            className="w-8 h-8 rounded-full object-cover bg-gray-600"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{result.fullName}</div>
            <div className="text-xs text-gray-400">
              {result.position} {result.teamName && `- ${result.teamName}`}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
