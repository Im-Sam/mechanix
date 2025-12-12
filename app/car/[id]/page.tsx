import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecordForm from './RecordForm'
import { 
  ArrowLeft, 
  Calendar, 
  Hash, 
  Wrench, 
  FileText, 
  ExternalLink,
  AlertTriangle,
  ArrowRightLeft
} from 'lucide-react'

// Next.js 15: Props must be awaited
export default async function CarDetails(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  
  // 1. Fetch Car
  const { data: car } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (!car) return redirect('/')

  // 2. Fetch Records
  const { data: records } = await supabase
    .from('maintenance_records')
    .select('*')
    .eq('vehicle_id', car.id)
    .order('created_at', { ascending: false })

  // 3. Server Action for Transfer Code
  async function generateTransferCode() {
    "use server"
    const code = Math.random().toString(36).substring(7).toUpperCase()
    const supabase = await createClient()
    await supabase.from('vehicles').update({ transfer_code: code }).eq('id', params.id)
    redirect(`/car/${params.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation / Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Garage
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{car.year} {car.make} {car.model}</h1>
              <div className="flex items-center gap-4 mt-2 text-gray-500">
                 <span className="flex items-center gap-1 text-sm bg-white border px-2 py-1 rounded">
                   <Hash className="w-3 h-3" /> {car.vin || 'No VIN'}
                 </span>
              </div>
            </div>
            
            {/* Transfer Control - Collapsed or Active */}
            {!car.transfer_code ? (
              <form action={generateTransferCode}>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition">
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer Ownership
                </button>
              </form>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 max-w-md">
                 <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-bold text-amber-800">Transfer Mode Active</h4>
                    <p className="text-xs text-amber-700 mt-1 mb-2">
                      Share this code with the buyer. Once they claim it, you will lose access to this vehicle.
                    </p>
                    <div className="bg-white border border-amber-200 px-3 py-2 rounded font-mono text-lg font-bold text-center tracking-widest select-all">
                      {car.transfer_code}
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Input Form */}
          <div className="lg:col-span-1">
             <div className="sticky top-6">
                <RecordForm vehicleId={car.id} />
             </div>
          </div>

          {/* Right Column: Timeline */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              Service History
            </h2>

            <div className="space-y-4">
              {records?.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed p-12 text-center">
                   <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                     <Wrench className="w-6 h-6 text-gray-400" />
                   </div>
                   <h3 className="text-gray-900 font-medium">No records yet</h3>
                   <p className="text-gray-500 text-sm">Use the form to log your first maintenance.</p>
                </div>
              ) : (
                records?.map((rec) => {
                  // --- FIX STARTS HERE ---
                  // We generate the URL properly using the Supabase client
                  let publicUrl = null
                  if (rec.image_path) {
                    const { data } = supabase.storage.from('car-docs').getPublicUrl(rec.image_path)
                    publicUrl = data.publicUrl
                  }
                  // --- FIX ENDS HERE ---

                  return (
                    <div key={rec.id} className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-50 p-2 rounded-lg">
                              <Wrench className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{rec.service_type}</h3>
                              <p className="text-xs text-gray-500">
                                {new Date(rec.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-gray-900 text-lg">
                              ${parseFloat(rec.cost).toFixed(2)}
                            </div>
                        </div>
                      </div>

                      {rec.description && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 mb-4 border border-gray-100">
                          <p>{rec.description}</p>
                        </div>
                      )}

                      {/* Display the link using the generated publicUrl */}
                      {publicUrl && (
                        <div className="border-t pt-3 flex justify-end">
                          <a 
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100"
                          >
                            <FileText className="w-3 h-3" />
                            View Receipt / Attachment
                            <ExternalLink className="w-3 h-3 ml-0.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}