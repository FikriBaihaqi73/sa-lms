import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { PermissionPage } from '@/features/permissions';
import { ShieldCheck, LogOut, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
        <div className="mb-6 text-center max-w-md">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Akses Terproteksi Superadmin
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Anda harus menyelesaikan autentikasi (login) terlebih dahulu untuk dapat mengelola data Permission Management.
          </p>
        </div>

        {authView === 'login' ? (
          <LoginForm onRegisterClick={() => setAuthView('register')} />
        ) : (
          <RegisterForm onLoginClick={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Protected App Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between text-sm shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            SaaS LMS Superadmin Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            ● Session Active
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 hover:border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </nav>

      {/* Main Permission Feature View */}
      <PermissionPage />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
