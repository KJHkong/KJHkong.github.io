'use client';

import { createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocaleStore } from '@/lib/stores/localeStore';
import type { I18nRuntimeConfig } from '@/types/i18n';

interface LocaleProviderProps {
  config: I18nRuntimeConfig;
  children: ReactNode;
}

const DefaultLocaleContext = createContext('en');

// Use the configured default for SSR and the first hydration render.
export function useCurrentLocale() {
  const defaultLocale = useContext(DefaultLocaleContext);
  return useLocaleStore((state) => state.isReady ? state.locale : defaultLocale);
}

export function LocaleProvider({ config, children }: LocaleProviderProps) {
  const initialize = useLocaleStore((state) => state.initialize);

  useEffect(() => {
    initialize(config);
  }, [initialize, config]);

  return <DefaultLocaleContext.Provider value={config.defaultLocale}>{children}</DefaultLocaleContext.Provider>;
}
