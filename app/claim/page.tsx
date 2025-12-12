import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClaimCar() {
  
    async function claimVehicle(formData: FormData) {
    "use server"
    const code = formData.get('code') as string
    const supabase = await createClient()
    
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // 2. Find vehicle with this code
    // Note: We need to use specific logic here because RLS usually hides vehicles we don't own.
    // However, for this MVP, we can bypass RLS via a Postgres Function or use a specific query.
    // A secure way: Use a Remote Procedure Call (RPC)
    
    const { error } = await supabase.rpc('claim_vehicle_by_code', {
      claim_code: code,
      new_owner_id: user.id
    })

    if (error) {
       console.error(error)
       // handle error (e.g. invalid code)
    } else {
       redirect('/')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <form action={claimVehicle} className="flex flex-col gap-4 border p-8 rounded bg-white shadow-lg">
        <h1 className="text-2xl font-bold">Claim a Vehicle</h1>
        <p className="text-gray-600 max-w-sm">Enter the unique transfer code provided by the seller to transfer the car and its history to your garage.</p>
        <input name="code" placeholder="Enter Code (e.g. X7Z9A)" className="border p-4 text-center text-xl tracking-widest uppercase" required />
        <button className="bg-green-600 text-white p-3 rounded font-bold">Claim Vehicle</button>
      </form>
    </div>
  )
}