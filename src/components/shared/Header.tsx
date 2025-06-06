"use client";

import Link from "next/link";
import { Sparkles, LogIn, LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth"; // Will create this hook

export default function Header() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="bg-card shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
          <Sparkles className="h-8 w-8" />
          <span className="text-2xl font-headline font-bold">Austin Clean Sweep</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/booking">
            <Button variant="ghost" className="text-foreground/80 hover:text-primary hover:bg-primary/10">
              Book Now
            </Button>
          </Link>
          {isAdmin && (
             <Link href="/admin">
              <Button variant="ghost" className="text-foreground/80 hover:text-primary hover:bg-primary/10">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Admin
              </Button>
            </Link>
          )}
          {user ? (
            <Button variant="outline" onClick={logout} className="border-primary text-primary hover:bg-primary/10">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          ) : (
            <Link href="/admin/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                 <LogIn className="mr-2 h-4 w-4" /> Admin Login
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
