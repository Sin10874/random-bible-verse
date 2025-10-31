"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setIsOpen(false);

    // Remove the current locale from pathname and add the new one
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    router.push(newPath);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20
                   ring-1 ring-white/25 px-3 py-2 backdrop-blur transition cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <span className="text-lg leading-none">{localeFlags[locale as Locale]}</span>
        <span className="text-sm font-medium hidden sm:inline">
          {localeNames[locale as Locale]}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl bg-white/95 backdrop-blur-lg
                     shadow-lg ring-1 ring-black/5 overflow-hidden z-50"
        >
          <div className="py-1">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLocaleChange(loc)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer
                           transition-colors ${
                             loc === locale
                               ? "bg-blue-50 text-blue-900 font-medium"
                               : "text-gray-900 hover:bg-gray-50"
                           }`}
              >
                <span className="text-lg leading-none">{localeFlags[loc]}</span>
                <span>{localeNames[loc]}</span>
                {loc === locale && (
                  <svg
                    className="w-4 h-4 ml-auto text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
