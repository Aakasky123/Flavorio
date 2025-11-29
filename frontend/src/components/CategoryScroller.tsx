interface Props {
  categories: string[];
  selected?: string | null;
  onSelect: (category: string | null) => void;
}

export default function CategoryScroller({ categories, selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect(null)}
        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
          !selected
            ? 'border-rose-500 bg-rose-50 text-rose-600'
            : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200 hover:text-rose-600'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
            selected === category
              ? 'border-rose-500 bg-rose-50 text-rose-600'
              : 'border-gray-200 bg-white text-gray-700 hover:border-rose-200 hover:text-rose-600'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
