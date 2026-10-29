import { createContext, useContext } from "react";

export const HostelCareContext = createContext(null);

export function useHostelCare() {
  const context = useContext(HostelCareContext);
  if (!context) throw new Error("useHostelCare must be used inside HostelCareContext.Provider");
  return context;
}
