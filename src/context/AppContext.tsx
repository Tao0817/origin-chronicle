import { createContext, useContext, useState, type ReactNode } from "react";
import type { TimelineEvent } from "../types";

interface AppContextValue {
  selectedEvent: TimelineEvent | null;
  setSelectedEvent: (event: TimelineEvent | null) => void;
}

const AppContext = createContext<AppContextValue>({
  selectedEvent: null,
  setSelectedEvent: () => {},
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  return (
    <AppContext.Provider value={{ selectedEvent, setSelectedEvent }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
