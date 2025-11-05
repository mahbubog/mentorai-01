import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onSelect: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onSelect,
  placeholder = 'Select options...',
  className,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onSelect(selected.filter((item) => item !== value));
    } else {
      onSelect([...selected, value]);
    }
  };

  const handleClearAll = () => {
    onSelect([]);
  };

  const selectedLabels = selected
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="block truncate">
          {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <div className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <div className="py-2 px-3 text-sm text-muted-foreground">No options available.</div>
            ) : (
              options.map((option) => (
                <div
                  key={option.value}
                  className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  onClick={() => handleToggle(option.value)}
                >
                  <span
                    className={cn(
                      'absolute left-2 flex h-3.5 w-3.5 items-center justify-center',
                      selected.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                  {option.label}
                </div>
              ))
            )}
          </div>
          {selected.length > 0 && (
            <div className="border-t mt-1 pt-1">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex w-full items-center justify-center rounded-sm py-1.5 text-sm text-destructive hover:bg-accent"
              >
                <X className="h-4 w-4 mr-2" /> Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}