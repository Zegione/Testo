
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Generic Label
import { Textarea } from "@/components/ui/textarea";
import { Download, Printer, Edit3, Save, XCircle, UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"; // Form-specific components
import { useToast } from "@/hooks/use-toast";
import { useAuth, AppUser } from "@/hooks/useAuth"; 
import { updateUserDocument } from "@/contexts/AuthContext";
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp and other firestore functions
import { db } from '@/lib/firebase'; // Import db instance
import { Skeleton } from "@/components/ui/skeleton";

// Default values if data is not available from Firestore
const initialStudentDataBaseDefaults = {
  name: "Nama Mahasiswa",
  studentId: "NIM Mahasiswa", // This is NIM
  faculty: "Fakultas",
  major: "Program Studi",
  phone: "",
  address: "",
  avatarUrl: "https://placehold.co/150x150.png",
  sklUrl: "https://placehold.co/800x1100.png",
  stijazahUrl: "https://placehold.co/800x1100.png",
};

// Zod schema for form validation
const profileFormSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter.").max(100),
  studentId: z.string().min(5, "NIM minimal 5 karakter.").max(20)
    .regex(/^[a-zA-Z0-9]+$/, { message: "NIM hanya boleh berisi huruf dan angka." }),
  faculty: z.string().min(3, "Fakultas minimal 3 karakter.").max(100).optional().or(z.literal('')),
  major: z.string().min(3, "Program studi minimal 3 karakter.").max(100).optional().or(z.literal('')),
  email: z.string().email("Format email tidak valid.").readonly(),
  phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface PageStateProfileData extends ProfileFormValues {
  avatarUrl?: string;
  sklUrl?: string;
  stijazahUrl?: string;
}

export default function StudentDataPage() {
  const { user, initialLoading: authInitialLoading, refreshUser } = useAuth();
  const { toast } = useToast();

  const [pageProfileData, setPageProfileData] = useState<PageStateProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true); // For initial data load for this page
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(initialStudentDataBaseDefaults.avatarUrl);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email || "", 
      name: "",
      studentId: "",
      faculty: "",
      major: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (!authInitialLoading && user) {
      setIsLoadingData(true);
      const userDataFromAuth: PageStateProfileData = {
        name: user.name || initialStudentDataBaseDefaults.name,
        studentId: user.studentId || initialStudentDataBaseDefaults.studentId,
        faculty: user.faculty || initialStudentDataBaseDefaults.faculty,
        major: user.major || initialStudentDataBaseDefaults.major,
        email: user.email!, 
        phone: user.phone || "",
        address: user.address || "",
        avatarUrl: user.avatarUrl || initialStudentDataBaseDefaults.avatarUrl,
        sklUrl: user.sklUrl || initialStudentDataBaseDefaults.sklUrl,
        stijazahUrl: user.stijazahUrl || initialStudentDataBaseDefaults.stijazahUrl,
      };
      setPageProfileData(userDataFromAuth);
      form.reset(userDataFromAuth); 
      setAvatarPreview(userDataFromAuth.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
      setIsLoadingData(false);
    } else if (!authInitialLoading && !user) {
        setIsLoadingData(false);
        setPageProfileData(null); 
    }
  }, [user, authInitialLoading, form]);


  useEffect(() => {
    if (pageProfileData) {
      form.reset(pageProfileData);
      setAvatarPreview(pageProfileData.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
    }
  }, [isEditing, pageProfileData, form]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { 
        toast({
          title: "File terlalu besar",
          description: "Ukuran gambar avatar sebaiknya kurang dari 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.uid) {
      toast({ title: "Error", description: "Pengguna tidak terautentikasi.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    
    const dataToSave: Partial<AppUser> = {
      name: data.name,
      studentId: data.studentId, 
      faculty: data.faculty,
      major: data.major,
      phone: data.phone,
      address: data.address,
      avatarUrl: avatarPreview, 
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {...dataToSave, updatedAt: serverTimestamp()});
      
      await refreshUser(); 

      setIsEditing(false);
      toast({ title: "Profil Diperbarui", description: "Informasi Anda berhasil disimpan." });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({ title: "Gagal Menyimpan", description: error.message || "Tidak dapat menyimpan data profil.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (authInitialLoading || isLoadingData || !pageProfileData) { 
    return (
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="biodata" className="w-full">
           <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6 shadow-sm">
            <TabsTrigger value="biodata">Profil</TabsTrigger>
            <TabsTrigger value="skl">SKL</TabsTrigger>
            <TabsTrigger value="stijazah">STI</TabsTrigger>
          </TabsList>
          <TabsContent value="biodata">
            <Card className="shadow-lg">
              <CardHeader className="relative">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                  <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
                  <div className="text-center md:text-left">
                    <Skeleton className="h-8 w-48 mb-2 rounded" />
                    <Skeleton className="h-4 w-32 mb-1 rounded" />
                    <Skeleton className="h-4 w-40 rounded" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t">
                <div className="space-y-1"><Label>Email</Label><Skeleton className="h-10 w-full rounded" /></div>
                <div className="space-y-1"><Label>Telepon</Label><Skeleton className="h-10 w-full rounded" /></div>
                <div className="space-y-1"><Label>Nama Lengkap</Label><Skeleton className="h-10 w-full rounded" /></div>
                <div className="space-y-1"><Label>NIM</Label><Skeleton className="h-10 w-full rounded" /></div>
                <div className="space-y-1"><Label>Fakultas</Label><Skeleton className="h-10 w-full rounded" /></div>
                <div className="space-y-1"><Label>Program Studi</Label><Skeleton className="h-10 w-full rounded" /></div>
                <div className="md:col-span-2 space-y-1"><Label>Alamat</Label><Skeleton className="h-20 w-full rounded" /></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    );
  }


  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="biodata" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6 shadow-sm">
            <TabsTrigger value="biodata">Profil</TabsTrigger>
            <TabsTrigger value="skl">SKL</TabsTrigger>
            <TabsTrigger value="stijazah">STI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="biodata">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="shadow-lg">
                  <CardHeader className="relative">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                        <div className="relative">
                          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-md">
                            <AvatarImage src={avatarPreview} alt={pageProfileData.name} data-ai-hint="student portrait" />
                            <AvatarFallback>{pageProfileData.name?.substring(0,2).toUpperCase() || "S"}</AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <div className="absolute -bottom-2 -right-2">
                              <Label htmlFor="avatar-upload" className="cursor-pointer">
                                <Button size="icon" variant="outline" asChild className="rounded-full bg-background hover:bg-muted p-2 shadow-md">
                                  <span><UploadCloud className="h-5 w-5 text-primary" /></span>
                                </Button>
                              </Label>
                              <Input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={isSaving}
                              />
                            </div>
                          )}
                        </div>
                      <div className="text-center md:text-left">
                        {isEditing ? (
                          <>
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="mb-2">
                                  <FormControl>
                                    <Input placeholder="Nama Lengkap" {...field} className="text-2xl md:text-3xl font-headline h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="studentId"
                              render={({ field }) => (
                                <FormItem className="mb-1">
                                  <FormLabel className="sr-only">NIM</FormLabel>
                                  <FormControl>
                                    <Input placeholder="NIM" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                <FormField
                                  control={form.control}
                                  name="major"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                       <FormLabel className="sr-only">Program Studi</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Program Studi" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="faculty"
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormLabel className="sr-only">Fakultas</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Fakultas" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                          </>
                        ) : (
                          <>
                            <CardTitle className="text-2xl md:text-3xl font-headline">{pageProfileData.name}</CardTitle>
                            <CardDescription>NIM: {pageProfileData.studentId}</CardDescription>
                            <CardDescription>{pageProfileData.major || initialStudentDataBaseDefaults.major}, {pageProfileData.faculty || initialStudentDataBaseDefaults.faculty}</CardDescription>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isLoadingData || isSaving}>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit Profil
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" type="button" onClick={handleCancel} disabled={isSaving}>
                            <XCircle className="mr-2 h-4 w-4" /> Batal
                          </Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Simpan
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl> 
                            <Input 
                              {...field} 
                              readOnly 
                              disabled 
                              className="bg-muted/50 cursor-not-allowed border-dashed" 
                            />
                          </FormControl>
                          <FormDescription>Email login Anda (tidak dapat diubah di sini).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telepon</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Input placeholder="e.g., 081234567890" {...field} disabled={isSaving} />
                            </FormControl>
                          ) : (
                            <p className="text-sm font-medium py-2 min-h-[40px] flex items-center">{pageProfileData.phone || '-'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {!isEditing && ( 
                        <>
                         <FormItem>
                            <Label>Nama Lengkap</Label>
                            <p className="text-sm font-medium py-2 min-h-[40px] flex items-center">{pageProfileData.name}</p>
                         </FormItem>
                         <FormItem>
                            <Label>NIM</Label>
                            <p className="text-sm font-medium py-2 min-h-[40px] flex items-center">{pageProfileData.studentId}</p>
                         </FormItem>
                         <FormItem>
                            <Label>Fakultas</Label>
                            <p className="text-sm font-medium py-2 min-h-[40px] flex items-center">{pageProfileData.faculty || '-'}</p>
                         </FormItem>
                          <FormItem>
                            <Label>Program Studi</Label>
                            <p className="text-sm font-medium py-2 min-h-[40px] flex items-center">{pageProfileData.major || '-'}</p>
                         </FormItem>
                        </>
                    )}
                     {isEditing && ( 
                        <>
                        <FormField
                            control={form.control}
                            name="faculty"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Fakultas</FormLabel>
                                <FormControl>
                                    <Input placeholder="Fakultas" {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="major"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Program Studi</FormLabel>
                                <FormControl>
                                    <Input placeholder="Program Studi" {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                         />
                        </>
                    )}
                    <FormField
                      control={form.control}
                      name="address"
                       render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Alamat</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Textarea placeholder="Alamat lengkap Anda" {...field} className="min-h-[80px]" disabled={isSaving} />
                            </FormControl>
                          ) : (
                             <p className="text-sm font-medium py-2 whitespace-pre-line min-h-[40px] flex items-center">{pageProfileData.address || '-'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="skl">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Surat Keterangan Lulus (SKL)</CardTitle>
                <CardDescription>Sertifikat kelulusan resmi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Cetak</Button>
                  <Button><Download className="mr-2 h-4 w-4" /> Unduh PDF</Button>
                </div>
                <div className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] overflow-hidden">
                   <Image src={pageProfileData.sklUrl || initialStudentDataBaseDefaults.sklUrl} alt="Dokumen SKL" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="official document" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stijazah">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Surat Terima Ijazah (STI)</CardTitle>
                <CardDescription>Surat penerimaan ijazah resmi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex gap-2">
                  <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Cetak</Button>
                  <Button><Download className="mr-2 h-4 w-4" /> Unduh PDF</Button>
                </div>
                <div className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] overflow-hidden">
                  <Image src={pageProfileData.stijazahUrl || initialStudentDataBaseDefaults.stijazahUrl} alt="Dokumen STI" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="certificate diploma" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

