import { switchLocale } from "@/app/actions/locale";
import type { Locale } from "@/lib/i18n/locales";

export function LocaleSwitcher({ currentLocale, returnTo }: { currentLocale: Locale; returnTo: string }) {
  return (
    <div className="locale-switcher" aria-label="Language">
      <form action={switchLocale}>
        <input type="hidden" name="locale" value="ar" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button type="submit" aria-pressed={currentLocale === "ar"}>
          {"\u0627\u0644\u0639\u0631\u0628\u064a\u0629"}
        </button>
      </form>
      <form action={switchLocale}>
        <input type="hidden" name="locale" value="en" />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button type="submit" aria-pressed={currentLocale === "en"}>
          English
        </button>
      </form>
    </div>
  );
}
