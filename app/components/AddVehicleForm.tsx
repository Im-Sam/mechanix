'use client'

import { useState, useRef } from 'react'
import { addVehicle } from '@/app/actions'
import { Plus, Car, Calendar, Hash, Loader2 } from 'lucide-react' // Icons

export default function AddVehicleForm() {
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    await addVehicle(formData)
    setLoading(false)
    formRef.current?.reset() // Clears the text boxes
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
        <Plus className="w-5 h-5 text-blue-600" />
        Add to Garage
      </h2>
      
      <form 
        ref={formRef}
        action={handleSubmit} 
        className="grid grid-cols-1 md:grid-cols-12 gap-4"
      >
        {/* Year */}
        <div className="md:col-span-2 relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              name="year" 
              type="number" 
              placeholder="Year" 
              required
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400"
            />
        </div>

        {/* Make */}
        <div className="md:col-span-3 relative">
            <Car className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              name="make" 
              type="text" 
              placeholder="Make (e.g. Toyota)" 
              required
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400"
            />
        </div>

        {/* Model */}
        <div className="md:col-span-3 relative">
            <Car className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              name="model" 
              type="text" 
              placeholder="Model (e.g. Camry)" 
              required
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400"
            />
        </div>

        {/* VIN */}
        <div className="md:col-span-3 relative">
            <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              name="vin" 
              type="text" 
              placeholder="VIN (Optional)" 
              className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-gray-900 bg-white placeholder:text-gray-400"
            />
        </div>

        {/* Button */}
        <div className="md:col-span-1">
          <button 
            disabled={loading}
            className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>
      </form>
    </div>
  )
}