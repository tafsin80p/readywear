"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StoreSettingsContextType {
  showDiscountPrice: boolean;
  setShowDiscountPrice: (value: boolean) => void;
  offerCategoriesOnly: boolean;
  offerCategorySlugs: string[];
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  showDiscountPrice: true,
  setShowDiscountPrice: () => {},
  offerCategoriesOnly: false,
  offerCategorySlugs: [],
});

export function StoreSettingsProvider({
  children,
  initialShowDiscountPrice = true,
  initialOfferCategoriesOnly = false,
  initialOfferCategorySlugs = [],
}: {
  children: ReactNode;
  initialShowDiscountPrice?: boolean;
  initialOfferCategoriesOnly?: boolean;
  initialOfferCategorySlugs?: string[];
}) {
  const [showDiscountPrice, setShowDiscountPrice] = useState(initialShowDiscountPrice);
  const [offerCategoriesOnly, setOfferCategoriesOnly] = useState(initialOfferCategoriesOnly);
  const [offerCategorySlugs, setOfferCategorySlugs] = useState(initialOfferCategorySlugs);

  useEffect(() => {
    setShowDiscountPrice(initialShowDiscountPrice);
    setOfferCategoriesOnly(initialOfferCategoriesOnly);
    setOfferCategorySlugs(initialOfferCategorySlugs);
  }, [initialShowDiscountPrice, initialOfferCategoriesOnly, initialOfferCategorySlugs]);

  return (
    <StoreSettingsContext.Provider 
      value={{ 
        showDiscountPrice, 
        setShowDiscountPrice,
        offerCategoriesOnly,
        offerCategorySlugs
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  return useContext(StoreSettingsContext);
}
