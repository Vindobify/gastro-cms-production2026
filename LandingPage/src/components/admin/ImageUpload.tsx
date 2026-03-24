'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  purpose?: 'default' | 'og'
}

export default function ImageUpload({ value, onChange, label = 'Bild hochladen', purpose = 'default' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', purpose)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Upload fehlgeschlagen')
      const { url } = data
      onChange(url)
      toast.success(data.compressed ? 'Bild hochgeladen und komprimiert' : 'Bild hochgeladen')
    } catch {
      toast.error('Upload fehlgeschlagen')
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      {value ? (
        <div className="relative rounded-xl overflow-hidden h-48 bg-gray-100">
          <img src={value} alt="Upload preview" className="w-full h-full object-cover" />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p>Wird hochgeladen...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Upload size={32} className="text-gray-400" />
              <p className="font-medium">Bild hier ablegen oder klicken</p>
              <p className="text-xs">PNG, JPG, WebP, AVIF bis 10MB</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        </div>
      )}
    </div>
  )
}
