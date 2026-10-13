"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StoreSettingsContextType {
  showDiscountPrice: boolean;
  setShowDiscountPrice: (value: boolean) => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  showDiscountPrice: true,
  setShowDiscountPrice: () => {},
});

export function StoreSettingsProvider({
  children,
  initialShowDiscountPrice = true,
}: {
  children: ReactNode;
  initialShowDiscountPrice?: boolean;
}) {
  const [showDiscountPrice, setShowDiscountPrice] = useState(initialShowDiscountPrice);

  useEffect(() => {
    setShowDiscountPrice(initialShowDiscountPrice);
  }, [initialShowDiscountPrice]);

  return (
    <StoreSettingsContext.Provider value={{ showDiscountPrice, setShowDiscountPrice }}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
