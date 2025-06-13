
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Download, Printer, Edit3, Save, XCircle, UploadCloud } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth

const initialStudentDataBase = { // Base data without email
  name: "John Doe",
  studentId: "123456789",
  faculty: "Engineering",
  major: "Computer Science",
  phone: "081234567890",
  address: "123 Main Street, Anytown, ID",
  avatarUrl: "https://placehold.co/150x150.png",
  sklUrl: "https://placehold.co/800x1100.png",
  stijazahUrl: "https://placehold.co/800x1100.png",
};

const profileFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  studentId: z.string().min(5, "Student ID must be at least 5 characters."),
  faculty: z.string().min(3, "Faculty must be at least 3 characters."),
  major: z.string().min(3, "Major must be at least 3 characters."),
  email: z.string().email("Invalid email address.").readonly(), // Mark as readonly in schema if desired, or handle via UI
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function StudentDataPage() {
  const { user } = useAuth(); // Get user from AuthContext
  const { toast } = useToast();

  const [studentData, setStudentData] = useState(() => ({
    ...initialStudentDataBase,
    email: user?.email || "loading...", // Initialize email from user or placeholder
  }));
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(studentData.avatarUrl);

  // Effect to update studentData.email when user.email changes
  useEffect(() => {
    if (user?.email && studentData.email !== user.email) {
      setStudentData(prev => ({ ...prev, email: user.email! }));
    }
  }, [user?.email, studentData.email]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { // Default values will be updated by the effect below
      name: studentData.name,
      studentId: studentData.studentId,
      faculty: studentData.faculty,
      major: studentData.major,
      email: studentData.email,
      phone: studentData.phone,
      address: studentData.address,
    },
  });

  // Effect to reset form when edit mode changes or relevant studentData changes
  useEffect(() => {
    form.reset({
      name: studentData.name,
      studentId: studentData.studentId,
      faculty: studentData.faculty,
      major: studentData.major,
      email: studentData.email, // studentData.email is synced with user.email
      phone: studentData.phone,
      address: studentData.address,
    });
    if (isEditing) {
      setAvatarPreview(studentData.avatarUrl); // Ensure preview is current when entering edit mode
    }
  }, [isEditing, studentData.name, studentData.studentId, studentData.faculty, studentData.major, studentData.email, studentData.phone, studentData.address, studentData.avatarUrl, form]);


  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    // Email from 'data' is the auth email because the input was readOnly
    setStudentData(prev => ({
      ...prev,
      ...data, // data.email will be the auth email
      avatarUrl: avatarPreview,
      email: studentData.email, // Ensure it remains the synced email from auth user
    }));
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your information has been successfully saved.",
      variant: "default",
    });
  };

  const handleCancel = () => {
    // Form reset is handled by the useEffect watching 'isEditing'
    setAvatarPreview(studentData.avatarUrl); // Reset avatar preview to last saved state
    setIsEditing(false);
  };


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
                      <div className="relative">
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary shadow-md">
                          <AvatarImage src={avatarPreview} alt={studentData.name} data-ai-hint="student portrait" />
                          <AvatarFallback>{studentData.name.substring(0,2).toUpperCase()}</AvatarFallback>
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
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-center md:text-left">
                        {isEditing ? (
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem className="mb-2">
                                <FormControl>
                                  <Input placeholder="Full Name" {...field} className="text-2xl md:text-3xl font-headline h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <CardTitle className="text-2xl md:text-3xl font-headline">{studentData.name}</CardTitle>
                        )}

                        {isEditing ? (
                           <FormField
                            control={form.control}
                            name="studentId"
                            render={({ field }) => (
                              <FormItem className="mb-1">
                                <FormControl>
                                  <Input placeholder="Student ID" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring" />
                                </FormControl>
                                <FormDescription>Student ID</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <CardDescription>Student ID: {studentData.studentId}</CardDescription>
                        )}
                        
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row gap-2 mt-1">
                            <FormField
                              control={form.control}
                              name="major"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input placeholder="Major" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring"/>
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
                                    <Input placeholder="Faculty" {...field} className="text-sm h-auto p-1 border-0 focus-visible:ring-1 focus-visible:ring-ring" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ) : (
                          <CardDescription>{studentData.major}, {studentData.faculty}</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      {!isEditing ? (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" type="button" onClick={handleCancel}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                          </Button>
                          <Button type="submit">
                            <Save className="mr-2 h-4 w-4" /> Save Changes
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
                          {isEditing ? (
                            <FormControl>
                              <Input 
                                placeholder="your.email@example.com" 
                                {...field} 
                                readOnly 
                                disabled 
                                className="bg-muted/50 cursor-not-allowed border-dashed" 
                              />
                            </FormControl>
                          ) : (
                            <p className="text-sm font-medium py-2">{studentData.email}</p>
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
                              <Input placeholder="e.g., 081234567890" {...field} />
                            </FormControl>
                          ) : (
                            <p className="text-sm font-medium py-2">{studentData.phone || '-'}</p>
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
                              <Textarea placeholder="Your full address" {...field} className="min-h-[80px]" />
                            </FormControl>
                          ) : (
                             <p className="text-sm font-medium py-2 whitespace-pre-line">{studentData.address || '-'}</p>
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
                <CardDescription>Official graduation certificate.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline"><Printer className="mr-2 h-4 w-4" /> Print</Button>
                  <Button><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
                </div>
                <div className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] overflow-hidden">
                   <Image src={studentData.sklUrl} alt="SKL Document" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="official document" />
                </div>
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
                <div className="border rounded-md p-2 bg-muted/30 aspect-[1/1.414] overflow-hidden">
                  <Image src={studentData.stijazahUrl} alt="STI Document" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="certificate diploma" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

    