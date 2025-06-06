"use client";

import React, { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AdminRouteGuardProps {
  children: ReactNode;
}

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/admin/login');
      } else if (!isAdmin) {
        // Logged in but not admin, redirect to home or an unauthorized page
        router.push('/'); 
        // You could also show a toast message here via useToast() if desired
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    // Show a loading spinner or a minimal loading UI
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-foreground/70">Loading Admin Dashboard...</p>
      </div>
    );
  }

  // User is authenticated and is an admin
  return <>{children}</>;
}
