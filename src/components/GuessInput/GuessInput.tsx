import { useRef, useCallback, useState } from 'react';
import type { SearchResult } from '../../api/types';
import { useAutocomplete } from '../../hooks/useAutocomplete';
import { AutocompleteDropdown } from './AutocompleteDropdown';

interface GuessInputProps {
  onGuess: (playerId: string) => void;
  onSkip: () => void;
  disabled: boolean;
}

export function GuessInput({ onGuess, onSkip, disabled }: GuessInputProps) {
  const { query, results, isSearching, highlightIndex, search, moveHighlight, clear } =
    useAutocomplete();
  const [selectedPlayer, setSelectedPlayer] = useState<SearchResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setSelectedPlayer(result);
      search(result.fullName);
      // Clear the results dropdown
      setTimeout(() => {
        setSelectedPlayer(result);
      }, 0);
    },
    [search]
  );

  const handleSubmit = useCallback(() => {
    if (selectedPlayer) {
      onGuess(selectedPlayer.id);
      setSelectedPlayer(null);
      clear();
    } else if (highlightIndex >= 0 && results[highlightIndex]) {
      onGuess(results[highlightIndex].id);
      setSelectedPlayer(null);
      clear();
    }
  }, [selectedPlayer, highlightIndex, results, onGuess, clear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveHighlight('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveHighlight('up');
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightIndex >= 0 && results[highlightIndex]) {
            handleSelect(results[highlightIndex]);
          } else if (selectedPlayer) {
            handleSubmit();
          }
          break;
        case 'Escape':
          clear();
          break;
      }
    },
    [moveHighlight, highlightIndex, results, handleSelect, selectedPlayer, handleSubmit, clear]
  );

  const showDropdown = !selectedPlayer && results.length > 0 && query.length >= 2;

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setSelectedPlayer(null);
            search(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a player's name..."
          disabled={disabled}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {showDropdown && (
          <AutocompleteDropdown
            results={results}
            highlightIndex={highlightIndex}
            onSelect={handleSelect}
          />
        )}
      </div>
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleSubmit}
          disabled={disabled || !selectedPlayer}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          Submit Guess
        </button>
        <button
          onClick={onSkip}
          disabled={disabled}
          className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-300 rounded-lg transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
