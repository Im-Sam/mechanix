'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addVehicle(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const year = formData.get('year')
  const vin = formData.get('vin') as string

  if (!make || !model || !year) {
    return { error: 'Make, Model, and Year are required.' }
  }

  const { error } = await supabase.from('vehicles').insert({
    owner_id: user.id,
    make,
    model,
    year: Number(year),
    vin,
  })

  if (error) return { error: error.message }

  revalidatePath('/') // Refresh the dashboard immediately
  return { success: true }
}