import { createRoute, useNavigate } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { rootRoute } from '../__root';

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: function LoginPage() {
    const navigate = useNavigate();
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-950">
        <LoginForm onRegisterClick={() => navigate({ to: '/register' })} />
      </div>
    );
  },
});
