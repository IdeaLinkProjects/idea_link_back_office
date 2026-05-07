"use client";

import { Provider } from "react-redux";
import { AppPreferencesProvider } from "@/contexts/AppPreferencesContext";
import { store } from "@/lib/store";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <AppPreferencesProvider>{children}</AppPreferencesProvider>
    </Provider>
  );
}
