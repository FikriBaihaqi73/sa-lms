import { createRoute, useNavigate } from '@tanstack/react-router';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { rootRoute } from '../__root';

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: function RegisterPage() {
    const navigate = useNavigate();
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-100 dark:bg-slate-950">
        <RegisterForm onLoginClick={() => navigate({ to: '/login' })} />
      </div>
    );
  },
});
