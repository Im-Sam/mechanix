import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AddVehicleForm from './components/AddVehicleForm'
import { CarFront, ArrowRight, Wrench } from 'lucide-react'
import { LogOut } from 'lucide-react'


export default async function Dashboard() {
  const supabase = await createClient()
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch Vehicles
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  // 3. Define the Sign Out Action
  const signOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    return redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Virtual Garage</h1>
            <p className="text-gray-500 mt-1">Manage maintenance and history for your fleet.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-2 pl-4 rounded-lg border shadow-sm">
             <span className="text-sm font-medium text-gray-600">
               {user.email}
             </span>
             
             {/* The Logout Button Form */}
             <form action={signOut}>
               <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors">
                 <LogOut className="w-3 h-3" />
                 Log out
               </button>
             </form>
          </div>
        </div>

        {/* The New Form */}
        <AddVehicleForm />

        {/* Empty State */}
        {vehicles?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <CarFront className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Garage is empty</h3>
            <p className="text-gray-500">Add your first vehicle above to get started.</p>
          </div>
        )}

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles?.map((car) => (
            <Link 
              href={`/car/${car.id}`} 
              key={car.id}
              className="group block bg-white rounded-xl shadow-sm border hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden"
            >
              {/* Card Header (Colored Bar) */}
              <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:h-3 transition-all" />
              
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block mb-2">
                      {car.year}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {car.make} {car.model}
                    </h2>
                  </div>
                  <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-100 transition">
                    <CarFront className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                   <div className="flex items-center text-sm text-gray-500">
                      <span className="font-mono bg-gray-100 px-1 rounded text-xs mr-2">VIN</span>
                      {car.vin || 'Not recorded'}
                   </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center group-hover:bg-blue-50 transition">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                   <Wrench className="w-4 h-4" />
                   <span>Log Service</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 text-center border-t pt-8">
           <Link href="/claim" className="text-sm text-gray-500 hover:text-blue-600 hover:underline transition">
             Have a transfer code? Claim a vehicle here.
           </Link>
        </div>
      </div>
    </main>
  )
}