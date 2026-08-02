import Link from 'next/link'
import { Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { login } from '../actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const { message } = await searchParams

  return (
    <div className="flex flex-col space-y-6 w-full">
      <div className="flex flex-col space-y-2 text-center">
        <div className="mx-auto mb-2 flex items-center justify-center">
          <Activity className="h-8 w-8 text-primary font-bold" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to log in to your account
        </p>
      </div>

      {message && (
        <div className={`rounded-md p-3 text-sm text-center border ${
          message.toLowerCase().includes('check your email') || message.toLowerCase().includes('created') || message.toLowerCase().includes('confirm your email')
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-destructive/10 border-destructive/30 text-destructive'
        }`}>
          {message}
        </div>
      )}
      
      <form action={login} className="space-y-4 w-full">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="name@example.com" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            required 
          />
        </div>
        
        <Button type="submit" className="w-full">
          Log In
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
