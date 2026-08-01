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
          message.toLowerCase().includes('check your email') || message.toLowerCase().includes('created')
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
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
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
