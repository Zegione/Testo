
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Printer, Edit3, Save, XCircle, UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const initialStudentDataBaseDefaults = {
  name: "Student Name",
  studentId: "NIM/Student ID",
  faculty: "Faculty Name",
  major: "Major Name",
  phone: "",
  address: "",
  avatarUrl: "https://placehold.co/150x150.png",
  sklUrl: "https://placehold.co/800x1100.png",
  stijazahUrl: "https://placehold.co/800x1100.png",
};

const profileFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  studentId: z.string().min(5, "Student ID must be at least 5 characters."),
  faculty: z.string().min(3, "Faculty must be at least 3 characters."),
  major: z.string().min(3, "Major must be at least 3 characters."),
  email: z.string().email("Invalid email address.").readonly(),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileData extends ProfileFormValues {
  avatarUrl?: string;
  sklUrl?: string;
  stijazahUrl?: string;
}

export default function StudentDataPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<ProfileData>({
    ...initialStudentDataBaseDefaults,
    email: user?.email || "loading...",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(profileData.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileData,
  });

  useEffect(() => {
    if (user?.uid) {
      setIsLoadingData(true);
      const userDocRef = doc(db, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const dataFromDb = docSnap.data();
          const fetchedData: ProfileData = {
            name: dataFromDb.name || initialStudentDataBaseDefaults.name,
            studentId: dataFromDb.studentId || initialStudentDataBaseDefaults.studentId,
            faculty: dataFromDb.faculty || initialStudentDataBaseDefaults.faculty,
            major: dataFromDb.major || initialStudentDataBaseDefaults.major,
            email: user.email!, // Always use auth email
            phone: dataFromDb.phone || "",
            address: dataFromDb.address || "",
            avatarUrl: dataFromDb.avatarUrl || initialStudentDataBaseDefaults.avatarUrl,
            sklUrl: dataFromDb.sklUrl || initialStudentDataBaseDefaults.sklUrl,
            stijazahUrl: dataFromDb.stijazahUrl || initialStudentDataBaseDefaults.stijazahUrl,
          };
          setProfileData(fetchedData);
          form.reset(fetchedData);
          setAvatarPreview(fetchedData.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
        } else {
          // Document doesn't exist, use defaults and auth email
          // This case should ideally be handled at user registration if specific fields are mandatory
          const defaultDataWithAuthEmail: ProfileData = {
            ...initialStudentDataBaseDefaults,
            email: user.email!,
          };
          setProfileData(defaultDataWithAuthEmail);
          form.reset(defaultDataWithAuthEmail);
          setAvatarPreview(defaultDataWithAuthEmail.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
          console.warn("User document not found in Firestore for UID:", user.uid, ". Using default profile data structure.");
        }
      }).catch(error => {
        console.error("Error fetching user data:", error);
        toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
        const errorFallbackData: ProfileData = { ...initialStudentDataBaseDefaults, email: user.email! };
        setProfileData(errorFallbackData);
        form.reset(errorFallbackData);
        setAvatarPreview(errorFallbackData.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
      }).finally(() => {
        setIsLoadingData(false);
      });
    } else if (!user && !isLoadingData) {
        // if user becomes null and we are not already loading (e.g. logout)
        // Reset to initial defaults but keep email as 'loading...' or empty
        const loggedOutDefaults: ProfileData = {
             ...initialStudentDataBaseDefaults,
            email: "loading...", // or ""
        };
        setProfileData(loggedOutDefaults);
        form.reset(loggedOutDefaults);
        setAvatarPreview(loggedOutDefaults.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
        // No toast here as this could be a normal part of logout flow
    }
  }, [user, form, toast]); // Removed db from deps


  useEffect(() => {
    if (!isEditing) {
      form.reset(profileData);
      setAvatarPreview(profileData.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
    } else {
      // When entering edit mode, ensure form has up-to-date profileData
      form.reset(profileData); 
      setAvatarPreview(profileData.avatarUrl || initialStudentDataBaseDefaults.avatarUrl);
    }
  }, [isEditing, profileData, form]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Avatar image should be less than 2MB.",
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
      toast({ title: "Error", description: "User not authenticated. Cannot save.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const dataToSave: Partial<ProfileData> & { updatedAt: any } = { // Use Partial for fields, ensure all intended fields are included
      name: data.name,
      studentId: data.studentId,
      faculty: data.faculty,
      major: data.major,
      // email is not saved from form, it's fixed from auth
      phone: data.phone,
      address: data.address,
      avatarUrl: avatarPreview,
      updatedAt: serverTimestamp(),
    };

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, dataToSave);
      
      setProfileData(prev => ({ 
        ...prev, // Keep existing SKL/STI URLs
        ...dataToSave, 
        email: prev.email, // Ensure email is preserved from auth
        avatarUrl: avatarPreview 
      }));
      
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your information has been successfully saved." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({ title: "Error", description: "Could not save profile data. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // form.reset(profileData) and setAvatarPreview is handled by useEffect on isEditing change
  };

  if (isLoadingData && !user) { // If auth is still loading user, show full page loader
    return (
      <div className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <>
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="biodata" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6 shadow-sm">
            <TabsTrigger value="biodata">Profile</TabsTrigger>
            <TabsTrigger value="skl">Graduation Certificate (SKL)</TabsTrigger>
            <TabsTrigger value="stijazah">Diploma Acceptance (STI)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="biodata">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="shadow-lg">
                  <CardHeader className="relative">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                      {isLoadingData ? (
                        <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
                      ) : (
                        <div className="relative">
                          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-md">
                            <AvatarImage src={avatarPreview} alt={profileData.name} data-ai-hint="student portrait" />
                            <AvatarFallback>{profileData.name?.substring(0,2).toUpperCase() || "S"}</AvatarFallback>
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
                      )}
                      <div className="text-center md:text-left">
                        {isLoadingData ? (
                          <>
                            <Skeleton className="h-8 w-48 mb-2 rounded" />
                            <Skeleton className="h-4 w-32 mb-1 rounded" />
                            <Skeleton className="h-4 w-40 rounded" />
                          </>
                        ) : isEditing ? (
                          <>
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem className="mb-2">
                                  <FormControl>
                                    <Input placeholder="Full Name" {...field} className="text-2xl md:text-3xl font-headline h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
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
                                  <FormControl>
                                    <Input placeholder="Student ID" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
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
                                    <FormControl>
                                      <Input placeholder="Major" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
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
                                    <FormControl>
                                      <Input placeholder="Faculty" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" disabled={isSaving} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <CardTitle className="text-2xl md:text-3xl font-headline">{profileData.name}</CardTitle>
                            <CardDescription>Student ID: {profileData.studentId}</CardDescription>
                            <CardDescription>{profileData.major}, {profileData.faculty}</CardDescription>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)} disabled={isLoadingData}>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" type="button" onClick={handleCancel} disabled={isSaving}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                          </Button>
                          <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Changes
                          </Button>
                        </>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t">
                    {isLoadingData ? (
                        <>
                            <FormItem><FormLabel>Email</FormLabel><Skeleton className="h-8 w-full rounded" /></FormItem>
                            <FormItem><FormLabel>Phone</FormLabel><Skeleton className="h-8 w-full rounded" /></FormItem>
                            <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><Skeleton className="h-20 w-full rounded" /></FormItem>
                        </>
                    ) : (
                    <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          {isEditing ? ( // Even in edit mode, display as non-editable
                            <FormControl> 
                              <Input 
                                {...field} 
                                readOnly 
                                disabled 
                                className="bg-muted/50 cursor-not-allowed border-dashed" 
                              />
                            </FormControl>
                          ) : (
                            <p className="text-sm font-medium py-2">{profileData.email}</p>
                          )}
                          <FormDescription>Your login email (cannot be changed here).</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Input placeholder="e.g., 081234567890" {...field} disabled={isSaving} />
                            </FormControl>
                          ) : (
                            <p className="text-sm font-medium py-2">{profileData.phone || '-'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                       render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          {isEditing ? (
                            <FormControl>
                              <Textarea placeholder="Your full address" {...field} className="min-h-[80px]" disabled={isSaving} />
                            </FormControl>
                          ) : (
                             <p className="text-sm font-medium py-2 whitespace-pre-line">{profileData.address || '-'}</p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </>
                    )}
                  </CardContent>
                </Card>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="skl">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Surat Keterangan Lulus (SKL)</CardTitle>
                <CardDescription>Official graduation certificate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                  <Button><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
                {isLoadingData ? (
                     <Skeleton className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] w-full h-auto min-h-[500px]" />
                ) : (
                <div className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] overflow-hidden">
                   <Image src={profileData.sklUrl || initialStudentDataBaseDefaults.sklUrl} alt="SKL Document" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="official document" />
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stijazah">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Surat Terima Ijazah (STI)</CardTitle>
                <CardDescription>Official diploma acceptance letter.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex gap-2">
                  <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                  <Button><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
                 {isLoadingData ? (
                     <Skeleton className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] w-full h-auto min-h-[500px]" />
                ) : (
                <div className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] overflow-hidden">
                  <Image src={profileData.stijazahUrl || initialStudentDataBaseDefaults.stijazahUrl} alt="STI Document" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="certificate diploma" />
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

