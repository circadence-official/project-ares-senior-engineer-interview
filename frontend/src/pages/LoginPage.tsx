import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Mail, Lock, ArrowRight } from 'lucide-react';
import type { LoginCredentials } from '@/types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Array<{field: string, message: string}>>([]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    } as LoginCredentials,
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setSubmitError('');
        setValidationErrors([]);
        await login(value);
        toast.success('Login successful!');
        // Navigation will be handled by the useEffect above
      } catch (error: any) {
        // Handle validation errors specifically
        if (error.errors && Array.isArray(error.errors)) {
          setValidationErrors(error.errors);
          // Show the first validation error in toast
          const firstError = error.errors[0];
          toast.error(firstError.message);
        } else {
          const errorMessage = error.message || 'Login failed';
          setSubmitError(errorMessage);
          toast.error(errorMessage);
        }
      }
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl" />
      
      <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo/Brand Section */}
          <div className="text-center mb-8 space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <p className="text-gray-500 text-sm">Streamline your productivity</p>
          </div>

          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-2xl shadow-black/5 border-0 ring-1 ring-black/5">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Welcome back
              </CardTitle>
              <CardDescription className="text-center text-gray-600 text-base">
                Sign in to continue to your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  form.handleSubmit();
                }}
                className="space-y-5"
              >
                <form.Field name="email">
                  {(field) => (
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email address
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isLoading}
                          className="h-12 pl-4 pr-4 bg-white/80 border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 transition-all duration-200 placeholder:text-gray-400"
                        />
                      </div>
                      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="password">
                  {(field) => (
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </label>
                      <div className="relative">
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          disabled={isLoading}
                          className="h-12 pl-4 pr-4 bg-white/80 border-gray-200/60 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 transition-all duration-200 placeholder:text-gray-400"
                        />
                      </div>
                      {field.state.meta.errors && field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">
                      {submitError}
                    </p>
                  </div>
                )}

                {validationErrors.length > 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 font-medium mb-2">Please fix the following issues:</p>
                    <ul className="text-sm text-red-600 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{error.message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group" 
                  disabled={isLoading}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to TaskFlow?</span>
                </div>
              </div>

              <div className="text-center">
                <a 
                  href="/register" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 group"
                >
                  Create your account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Trust indicators */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-xs text-gray-500">Trusted by thousands of professionals</p>
            <div className="flex justify-center items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Fast
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Reliable
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};