"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return redirect('/login?message=' + encodeURIComponent('Invalid email or password. Please try again.'))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password || !name) {
    return redirect('/register?message=' + encodeURIComponent('All fields are required.'))
  }

  if (password.length < 6) {
    return redirect('/register?message=' + encodeURIComponent('Password must be at least 6 characters.'))
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      // Tell Supabase where to redirect after email confirmation
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
    }
  })

  if (error) {
    return redirect('/register?message=' + encodeURIComponent(error.message))
  }

  // The trigger on auth.users automatically creates the public.users profile.
  // No manual insert needed here.

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('Account created! Check your email to confirm your account before logging in.'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
