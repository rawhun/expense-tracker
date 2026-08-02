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
    const code = error.code || ''
    const msg = error.message?.toLowerCase() || ''
    const message =
      code === 'email_not_confirmed' || msg.includes('email not confirmed')
        ? 'Please confirm your email before logging in. Check your inbox for the verification link.'
        : 'Invalid email or password. Please try again.'
    return redirect('/login?message=' + encodeURIComponent(message))
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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/callback`,
    }
  })

  if (error) {
    return redirect('/register?message=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('Account created! Check your email to confirm your account before logging in.'))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
