import { FormEvent, useState } from 'react';

interface Props {
  initialQuery?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ initialQuery = '', onSearch }: Props) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for restaurants or cuisines"
        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          className="text-xs font-semibold text-gray-500 hover:text-rose-500"
        >
          Clear
        </button>
      )}
      <button
        type="submit"
        className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
      >
        Search
      </button>
    </form>
  );
}
