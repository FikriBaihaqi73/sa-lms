import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const [view, setView] = useState<'login' | 'register'>('login')

  return view === 'login' ? (
    <LoginForm onRegisterClick={() => setView('register')} />
  ) : (
    <RegisterForm onLoginClick={() => setView('login')} />
  )
}
