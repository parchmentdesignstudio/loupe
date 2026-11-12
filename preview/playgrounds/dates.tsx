import type { ReactNode } from 'react';
import { type DateValue, getLocalTimeZone, isWeekend, today } from '@internationalized/date';
import { I18nProvider, isRTL } from 'react-aria-components';

// What the date playgrounds share: a few locales to read dates in, one of them right to left, and the limits and
// unavailable days to try against

export const locales = { page: undefined, british: 'en-GB', american: 'en-US', german: 'de-DE', japanese: 'ja-JP', arabic: 'ar-EG' } as const;
export type LocaleName = keyof typeof locales;

/** Its children in a locale, with the direction that locale reads in, or the page's own */
export function InLocale({ name, children }: { name: LocaleName; children: ReactNode }) {
	const locale = locales[name];
	if (!locale) return children;
	return (
		<I18nProvider locale={locale}>
			<div lang={locale} dir={isRTL(locale) ? 'rtl' : 'ltr'} className="contents">
				{children}
			</div>
		</I18nProvider>
	);
}

export const now = () => today(getLocalTimeZone());

/** A month either side of today */
export const limits = () => ({ minValue: now().subtract({ months: 1 }), maxValue: now().add({ months: 1 }) });

/** Weekends in the locale in use, which aren't Saturday and Sunday everywhere */
export const weekends = (locale: string) => (date: DateValue) => isWeekend(date, locale);
