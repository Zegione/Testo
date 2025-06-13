
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, FormEvent, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginAs, setLoginAs] = useState<UserRole>("mahasiswa");
  const { loginUser, user, initialLoading, loading, error, clearError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!initialLoading && user) {
      router.push('/'); // Redirect to dashboard if logged in
    }
  }, [user, initialLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await loginUser(email, password, loginAs);
      // Navigation is handled inside loginUser on success
    } catch (err: any) {
      // Error is set in AuthContext, display it via toast
      // This catch block might not be strictly necessary if loginUser itself doesn't throw and just sets error state
      toast({
        title: "Login Failed",
        description: error || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Login Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  if (initialLoading || (!initialLoading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Login as</Label>
            <RadioGroup 
              defaultValue="mahasiswa" 
              onValueChange={(value) => setLoginAs(value as UserRole)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mahasiswa" id="r-mahasiswa" />
                <Label htmlFor="r-mahasiswa">Mahasiswa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dosen" id="r-dosen" />
                <Label htmlFor="r-dosen">Dosen</Label>
              </div>
               <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="r-admin" />
                <Label htmlFor="r-admin">Admin</Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Login
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="underline ml-1">
          Register
        </Link>
      </CardFooter>
    </Card>
  );
}
