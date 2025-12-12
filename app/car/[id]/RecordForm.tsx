'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Wrench, DollarSign, FileText, Camera, Loader2, PlusCircle } from 'lucide-react'

export default function RecordForm({ vehicleId }: { vehicleId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    
    const form = e.currentTarget
    const fileInput = form.elements.namedItem('image') as HTMLInputElement
    const file = fileInput.files?.[0]
    
    let imagePath = null

    // 1. Upload Image if exists
    if (file) {
      // Create a unique path: vehicle_id/timestamp-filename
      const fileName = `${vehicleId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
      const { error } = await supabase.storage.from('car-docs').upload(fileName, file)
      
      if (error) {
        console.error('Upload error:', error)
        alert('Failed to upload image')
        setLoading(false)
        return
      }
      imagePath = fileName
    }

    // 2. Insert Record
    const { error: dbError } = await supabase.from('maintenance_records').insert({
      vehicle_id: vehicleId,
      service_type: (form.elements.namedItem('service_type') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      cost: (form.elements.namedItem('cost') as HTMLInputElement).value,
      image_path: imagePath
    })

    if (dbError) {
      console.error('DB Error:', dbError)
      alert('Failed to save record')
    } else {
      formRef.current?.reset() // Clear the form
      router.refresh() // Refresh the background data
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
        <PlusCircle className="w-5 h-5 text-blue-600" />
        Log Service
      </h3>
      
      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Service Type */}
        <div className="relative md:col-span-1">
          <div className="absolute left-3 top-3 text-gray-400">
            <Wrench className="w-4 h-4" />
          </div>
          <input 
            name="service_type" 
            placeholder="Service Type (e.g. Oil Change)" 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400" 
            required 
          />
        </div>

        {/* Cost */}
        <div className="relative md:col-span-1">
          <div className="absolute left-3 top-3 text-gray-400">
            <DollarSign className="w-4 h-4" />
          </div>
          <input 
            name="cost" 
            type="number" 
            step="0.01"
            placeholder="Cost (0.00)" 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400" 
          />
        </div>

        {/* Description */}
        <div className="relative md:col-span-2">
          <div className="absolute left-3 top-3 text-gray-400">
            <FileText className="w-4 h-4" />
          </div>
          <textarea 
            name="description" 
            placeholder="Notes about the service (mechanic name, parts used, etc)..." 
            rows={3}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400 resize-none" 
          />
        </div>

        {/* Image Upload */}
        <div className="relative md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Attach Receipt / Photo</label>
            <div className="flex items-center gap-2">
                <div className="relative w-full">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Camera className="w-4 h-4" />
                    </div>
                    <input 
                        name="image" 
                        type="file" 
                        accept="image/*"
                        className="w-full pl-10 pr-4 py-1.5 border rounded-lg text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 bg-white" 
                    />
                </div>
            </div>
        </div>

        {/* Submit Button */}
        <div className="md:col-span-2 mt-2">
          <button 
            disabled={loading} 
            className="w-full bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Record...
                </>
            ) : (
                'Save Maintenance Record'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}