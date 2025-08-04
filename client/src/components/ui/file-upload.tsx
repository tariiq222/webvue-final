import { useState, useRef } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { compressImage, validateImage } from "@/utils/imageUtils"

interface FileUploadProps {
  label: string
  accept?: string
  maxSize?: number // in MB
  onFileSelect: (file: File | null) => void
  onDelete?: () => void // Custom delete handler
  preview?: string
  className?: string
  disabled?: boolean
}

export function FileUpload({
  label,
  accept = "image/*",
  maxSize = 5,
  onFileSelect,
  onDelete,
  preview,
  className,
  disabled = false
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { language } = useLanguage()

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      onFileSelect(null)
      return
    }

    // Check file type if accept is specified
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      alert(`يرجى اختيار نوع ملف صحيح: ${accept}`)
      return
    }

    // For image files, validate and compress if needed
    if (file.type.startsWith('image/')) {
      try {
        // Validate image
        const validation = await validateImage(file, 2 * 1024 * 1024); // 2MB limit
        if (!validation.valid) {
          alert(language === 'ar' ? validation.error : validation.error)
          return
        }

        // If file is larger than 500KB, compress it
        let processedFile = file;
        if (file.size > 500 * 1024) {
          try {
            processedFile = await compressImage(file, 800, 600, 0.8);
            console.log(`Image compressed from ${file.size} to ${processedFile.size} bytes`);
          } catch (error) {
            console.warn('Failed to compress image, using original:', error);
            // Continue with original file if compression fails
          }
        }

        // Final size check after compression
        if (processedFile.size > maxSize * 1024 * 1024) {
          alert(language === 'ar' ? `حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت` : `File size must be less than ${maxSize} MB`)
          return
        }

        onFileSelect(processedFile)
      } catch (error) {
        console.error('Error processing image:', error);
        alert(language === 'ar' ? 'خطأ في معالجة الصورة' : 'Error processing image')
      }
    } else {
      // For non-image files, just check size
      if (file.size > maxSize * 1024 * 1024) {
        alert(language === 'ar' ? `حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت` : `File size must be less than ${maxSize} MB`)
        return
      }
      onFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeFile = () => {
    if (onDelete) {
      // Use custom delete handler if provided
      onDelete()
    } else {
      // Default behavior
      onFileSelect(null)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      
      {preview ? (
        <div className="relative">
          <div className="w-32 h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeFile}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!disabled ? openFileDialog : undefined}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {language === 'ar' ? 'اسحب الملف هنا أو انقر للتصفح' : 'Drag file here or click to browse'}
          </p>
          <p className="text-xs text-slate-500">
            {language === 'ar' ? `الحد الأقصى: ${maxSize} ميجابايت` : `Max size: ${maxSize} MB`}
          </p>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        disabled={disabled}
      />
    </div>
  )
}
