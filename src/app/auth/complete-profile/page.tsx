
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // Corrected import path for useAuth
import { updateUserDocument } from "@/contexts/AuthContext"; // updateUserDocument is exported here
import { serverTimestamp } from "firebase/firestore"; // Added for profileCompletedAt
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const profileCompletionSchema = z.object({
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }).max(100),
  studentId: z.string().min(5, { message: "NIM minimal 5 karakter." }).max(20)
    .regex(/^[a-zA-Z0-9]+$/, { message: "NIM hanya boleh berisi huruf dan angka." }),
});

type ProfileCompletionFormValues = z.infer<typeof profileCompletionSchema>;

export default function CompleteProfilePage() {
  const { user, initialLoading, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileCompletionFormValues>({
    resolver: zodResolver(profileCompletionSchema),
    defaultValues: {
      fullName: "",
      studentId: "",
    },
  });

  useEffect(() => {
    if (!initialLoading && !user) {
      router.replace("/auth/login");
    }
    // If user data is already complete (e.g. name and studentId exist), redirect to dashboard
    if (!initialLoading && user && user.name && user.studentId) {
        router.replace("/");
    }
  }, [user, initialLoading, router]);


  const onSubmit = async (data: ProfileCompletionFormValues) => {
    if (!user || !user.uid) {
      toast({ title: "Error", description: "Sesi pengguna tidak ditemukan.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUserDocument(user.uid, {
        name: data.fullName,
        studentId: data.studentId, // This field is used as NIM for students
        profileCompletedAt: serverTimestamp(), // Mark profile as completed
      });
      await refreshUser(); // Refresh user data in context
      toast({ title: "Profil Disimpan", description: "Informasi profil Anda berhasil disimpan." });
      router.push("/"); // Redirect to dashboard
    } catch (error: any) {
      console.error("Error completing profile:", error);
      toast({ title: "Gagal Menyimpan", description: error.message || "Terjadi kesalahan saat menyimpan profil.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initialLoading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // This check might be redundant due to useEffect but good for clarity
  if (!user) return null; 
  // If profile is already complete and somehow this page is accessed, redirect.
  if (user.name && user.studentId) {
    // router.replace('/'); // This is handled by useEffect now
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }


  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Lengkapi Profil Anda</CardTitle>
        <CardDescription>
          Silakan masukkan nama lengkap dan NIM Anda untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NIM (Nomor Induk Mahasiswa)</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan NIM Anda" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan dan Lanjutkan
            </Button>
          </form>
        </Form>
      </CardContent>
       <CardFooter className="text-sm text-center">
        <p className="text-muted-foreground">Pastikan data yang Anda masukkan sudah benar.</p>
      </CardFooter>
    </Card>
  );
}
