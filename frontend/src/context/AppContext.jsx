import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  return (
    <AppContext.Provider value={{ selectedSite, setSelectedSite, selectedAsset, setSelectedAsset }}>
      {children}
    </AppContext.Provider>
  );
};
