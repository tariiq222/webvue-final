import { Button } from "./button"
import { useLanguage } from "@/contexts/LanguageContext"

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all duration-200 hover:scale-105 relative group"
      title={language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <div className="relative flex items-center justify-center w-5 h-5">
        {/* Arabic indicator */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            language === 'ar'
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 rotate-180'
          }`}
        >
          ع
        </span>

        {/* English indicator */}
        <span
          className={`absolute inset-0 flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            language === 'en'
              ? 'opacity-100 scale-100 rotate-0'
              : 'opacity-0 scale-75 rotate-180'
          }`}
        >
          A
        </span>
      </div>

      {/* Tooltip */}
      <span className="sr-only">{t('language')}</span>

      {/* Hover indicator */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </Button>
  )
}