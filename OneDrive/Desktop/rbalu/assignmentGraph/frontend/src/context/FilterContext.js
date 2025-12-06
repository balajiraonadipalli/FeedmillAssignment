import React, { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
};

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    timeRange: 'wtd',
    product: null,
    line: null,
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      timeRange: 'wtd',
      product: null,
      line: null,
    });
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export { FilterContext };

