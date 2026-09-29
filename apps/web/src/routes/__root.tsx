import { createRootRoute, Outlet } from '@tanstack/react-router'
import { AuthProvider } from '@/features/auth/context/AuthContext'

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center py-8">
        <Outlet />
      </main>
    </AuthProvider>
  ),
})
