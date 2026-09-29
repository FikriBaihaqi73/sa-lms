import { useState } from 'react'
import { AuthProvider } from '@/features/auth/context/AuthContext'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { RolesPermissionPage } from '@/features/roles-permission/components/RolesPermissionPage'

function App() {
  const [view, setView] = useState<'login' | 'register' | 'roles'>('roles')

  return (
    <AuthProvider>
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center">
        {view === 'login' ? (
          <LoginForm onRegisterClick={() => setView('register')} />
        ) : view === 'register' ? (
          <RegisterForm onLoginClick={() => setView('login')} />
        ) : (
          <div className="w-full h-screen overflow-auto pt-10">
             <div className="w-full flex justify-center mb-4">
                <button onClick={() => setView('login')} className="text-sm underline text-blue-500">Back to Login</button>
             </div>
             <RolesPermissionPage />
          </div>
        )}
      </main>
    </AuthProvider>
  )
}

export default App
