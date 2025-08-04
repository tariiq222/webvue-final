import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { Label } from "./label"
import { Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

interface DualLanguageInputProps {
  label: string
  value: {
    en: string
    ar: string
  }
  onChange: (value: { en: string; ar: string }) => void
  placeholder?: {
    en: string
    ar: string
  }
  type?: 'input' | 'textarea'
  className?: string
  disabled?: boolean
  required?: boolean
}

export function DualLanguageInput({
  label,
  value,
  onChange,
  placeholder = { en: '', ar: '' },
  type = 'input',
  className,
  disabled = false,
  required = false
}: DualLanguageInputProps) {
  const { language } = useLanguage()
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ar'>(language === 'ar' ? 'ar' : 'en')

  const handleValueChange = (newValue: string) => {
    onChange({
      ...value,
      [activeLanguage]: newValue
    })
  }

  const toggleLanguage = () => {
    setActiveLanguage(activeLanguage === 'en' ? 'ar' : 'en')
  }

  const InputComponent = type === 'textarea' ? Textarea : Input

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 px-3 text-xs"
          disabled={disabled}
        >
          <Languages className="h-3 w-3 mr-1" />
          {activeLanguage === 'en' ? 'English' : 'عربي'}
        </Button>
      </div>
      
      <div className="relative">
        <InputComponent
          value={value?.[activeLanguage] || ''}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={placeholder?.[activeLanguage] || ''}
          disabled={disabled}
          required={required}
          className={cn(
            "transition-all duration-200",
            activeLanguage === 'ar' && "text-right"
          )}
          dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
        />
        
        {/* Language indicator */}
        <div className="absolute top-2 right-2 text-xs text-slate-400 pointer-events-none">
          {activeLanguage.toUpperCase()}
        </div>
      </div>
      
      {/* Show both values when not empty */}
      {(value?.en || value?.ar) && (
        <div className="text-xs text-slate-500 space-y-1">
          {value?.en && (
            <div className="flex gap-2">
              <span className="font-medium">EN:</span>
              <span className="truncate">{value.en}</span>
            </div>
          )}
          {value?.ar && (
            <div className="flex gap-2">
              <span className="font-medium">AR:</span>
              <span className="truncate text-right" dir="rtl">{value.ar}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
