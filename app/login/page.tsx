import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Login(props: { 
  searchParams: Promise<{ message: string }> 
}) {
  // 1. Unwrap the searchParams promise
  const searchParams = await props.searchParams;

  const signIn = async (formData: FormData) => {
    "use server"
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // If login fails, try signing up 
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      if (signUpError) return redirect('/login?message=' + signUpError.message)
    }

    return redirect('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <form action={signIn} className="flex flex-col gap-4 border p-8 rounded">
        <h1 className="text-2xl font-bold text-center">Log In / Sign Up</h1>
        <input name="email" type="email" placeholder="Email" className="border p-2" required />
        <input type="password" name="password" placeholder="Password" className="border p-2" required />
        <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
          Continue
        </button>
        
        {/* 2. Access the unwrapped message */}
        {searchParams.message && (
          <p className="text-red-500 text-sm text-center max-w-[250px]">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}