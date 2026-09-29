import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { RegisterSchema } from '@repo/shared/schemas/auth.schema';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { registerApi } from '../api/register';
import { Eye, EyeOff } from 'lucide-react';

const FrontendRegisterSchema = RegisterSchema.extend({
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof FrontendRegisterSchema>;

export function RegisterForm({ onLoginClick }: { onLoginClick: () => void }) {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(FrontendRegisterSchema),
    defaultValues: {
      role: 'student',
    }
  });

  const selectedRole = useWatch({ control, name: 'role' });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setError('');
      setSuccess('');
      await registerApi({
        email: data.email,
        password: data.password,
        role: data.role,
        institutionName: data.institutionName,
      });
      setSuccess('Account created successfully! You can now sign in.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-zinc-200/80 dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Create an Account
          </CardTitle>
          <CardDescription className="text-base">
            Register to get access to the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200 dark:bg-red-950/50 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-600 border border-green-200 dark:bg-green-950/50 dark:border-green-900/50 dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold">Register As</Label>
              <Select
                id="role"
                {...register('role')}
                className="h-11"
              >
                <option value="student">Student</option>
                <option value="instansi">Instansi</option>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.role.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input
                id="email"
                {...register('email')}
                type="email"
                placeholder="name@example.com"
                className="h-11"
              />
              {errors.email && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {selectedRole === 'instansi' && (
              <div className="space-y-2.5">
                <Label htmlFor="institutionName" className="text-sm font-semibold">Institution Name</Label>
                <Input
                  id="institutionName"
                  {...register('institutionName')}
                  type="text"
                  placeholder="Example Academy"
                  className="h-11"
                />
                {errors.institutionName && (
                  <p className="text-sm text-red-500 font-medium">
                    {errors.institutionName.message}
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-semibold mt-4"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
            
            <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={onLoginClick}
                className="text-zinc-900 font-semibold underline-offset-4 hover:underline dark:text-zinc-100"
              >
                Sign in
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
