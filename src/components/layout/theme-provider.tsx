"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface ThemeContextValue {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("turnitout-theme") || "light";
    setThemeState(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("turnitout-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
