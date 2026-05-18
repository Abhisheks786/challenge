import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useElectionStore } from '../../store/useElectionStore';
import { MapPin } from 'lucide-react';





export function LocationInput({ placeholder = 'Enter your state or district...' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [results, setResults] = useState([]);
  const applyDashboardUpdate = useElectionStore((s) => s.applyDashboardUpdate);

  useEffect(() => {
    if (debouncedSearchTerm.trim().length > 2) {
      // Mock API call for autocomplete
      const mockLocations = ['Maharashtra', 'Mumbai', 'Madhya Pradesh', 'Manipur'];
      const filtered = mockLocations.filter((loc) =>
      loc.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleSelect = (location) => {
    setSearchTerm(location);
    setResults([]);
    // Update global dashboard context
    applyDashboardUpdate({
      location: { state: location, confirmed: true }
    });
  };

  return (
    <div className="relative w-full max-w-sm mt-2">
      <div className="relative">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg py-2 pl-10 pr-4 text-sm text-neutral-100 focus:outline-none focus:border-orange-500" />
        
      </div>
      {results.length > 0 &&
      <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden z-10">
          {results.map((res, idx) =>
        <button
          key={idx}
          onClick={() => handleSelect(res)}
          className="w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 text-neutral-200">
          
              {res}
            </button>
        )}
        </div>
      }
    </div>);

}