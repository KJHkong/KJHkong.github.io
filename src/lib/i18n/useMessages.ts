'use client';

import { getMessages } from '@/lib/i18n/messages';
import { useCurrentLocale } from '@/components/ui/LocaleProvider';

export function useMessages() {
  const locale = useCurrentLocale();
  return getMessages(locale);
}
