import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Key, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'

export default async function ClaimCar() {
  
  async function claimVehicle(formData: FormData) {
    "use server"
    const code = formData.get('code') as string
    const supabase = await createClient()
    
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Execute Transfer via RPC
    const { error } = await supabase.rpc('claim_vehicle_by_code', {
      claim_code: code.trim().toUpperCase(), // sanitize input
      new_owner_id: user.id
    })

    if (error) {
       console.error(error)
       return redirect('/claim?error=Invalid Code')
    } else {
       redirect('/')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      {/* Header Section */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4">
          <Key className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Claim Ownership
        </h2>
        <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
          Enter the secure transfer code provided by the previous owner to instantly move the vehicle into your garage.
        </p>
      </div>

      {/* Card Section */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200 border rounded-xl sm:px-10">
          
          <form action={claimVehicle} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-center mb-4">
                ENTER TRANSFER CODE
              </label>
              <div className="relative rounded-md shadow-sm">
                {/* Visual Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-gray-400" />
                </div>
                
                {/* The Input - Large, Monospace, Uppercase */}
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  placeholder="X7Z-9A"
                  className="block w-full pl-10 pr-3 py-4 text-center text-2xl font-mono font-bold tracking-[0.3em] uppercase border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-300 placeholder:normal-case placeholder:tracking-normal transition-all"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Claim Vehicle
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Secure Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
             <ShieldCheck className="w-4 h-4" />
             <span>Secure Transfer Protocol</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
             <Link 
                href="/" 
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition"
             >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
             </Link>
        </div>
      </div>
    </div>
  )
}