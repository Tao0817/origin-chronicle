import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TimelineEvent } from "../types";
import "../electron.d.ts";

const isElectron = typeof window !== "undefined" && !!window.electronAPI;

interface AppContextValue {
  selectedEvent: TimelineEvent | null;
  setSelectedEvent: (event: TimelineEvent | null) => void;
  saveData: <T>(key: string, data: T) => Promise<void>;
  loadData: <T>(key: string) => Promise<T | null>;
  deleteData: (key: string) => Promise<void>;
  isElectron: boolean;
}

const AppContext = createContext<AppContextValue>({
  selectedEvent: null,
  setSelectedEvent: () => {},
  saveData: async () => {},
  loadData: async () => null,
  deleteData: async () => {},
  isElectron: false,
});

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const saveData = useCallback(async <T,>(key: string, data: T): Promise<void> => {
    console.log('saveData called:', key);
    const content = JSON.stringify(data, null, 2);
    if (isElectron && window.electronAPI) {
      await window.electronAPI.writeFile(`${key}.json`, content);
    } else {
      localStorage.setItem(key, content);
    }
  }, []);

  const loadData = useCallback(async <T,>(key: string): Promise<T | null> => {
    if (isElectron && window.electronAPI) {
      const result = await window.electronAPI.readFile(`${key}.json`);
      if (result.success && result.data) {
        return JSON.parse(result.data) as T;
      }
      return null;
    } else {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : null;
    }
  }, []);

  const deleteData = useCallback(async (key: string): Promise<void> => {
    if (isElectron && window.electronAPI) {
      await window.electronAPI.deleteFile(`${key}.json`);
    } else {
      localStorage.removeItem(key);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        selectedEvent,
        setSelectedEvent,
        saveData,
        loadData,
        deleteData,
        isElectron,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
