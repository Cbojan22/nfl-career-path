import { useState, useCallback, useRef, useEffect } from 'react';
import { searchNflPlayers } from '../api/searchService';
import type { SearchResult } from '../api/types';

export function useAutocomplete() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const currentQuery = useRef('');
  const mounted = useRef(true);

  const search = useCallback((text: string) => {
    setQuery(text);
    setHighlightIndex(-1);
    currentQuery.current = text;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (text.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const items = await searchNflPlayers(text);
        if (mounted.current && currentQuery.current === text) {
          setResults(items);
        }
      } catch {
        if (mounted.current && currentQuery.current === text) {
          setResults([]);
        }
      } finally {
        if (mounted.current && currentQuery.current === text) {
          setIsSearching(false);
        }
      }
    }, 300);
  }, []);

  const moveHighlight = useCallback(
    (direction: 'up' | 'down') => {
      setHighlightIndex((prev) => {
        if (direction === 'down') {
          return prev < results.length - 1 ? prev + 1 : 0;
        }
        return prev > 0 ? prev - 1 : results.length - 1;
      });
    },
    [results.length]
  );

  const clear = useCallback(() => {
    setQuery('');
    setResults([]);
    setHighlightIndex(-1);
    setIsSearching(false);
    currentQuery.current = '';
  }, []);

  useEffect(() => {
    return () => {
      mounted.current = false;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  return {
    query,
    results,
    isSearching,
    highlightIndex,
    search,
    moveHighlight,
    clear,
  };
}
