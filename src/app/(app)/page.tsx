
"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, BookOpen, CalendarCheck2, TrendingUp, GraduationCap as GraduationCapIcon, LineChart as LineChartIcon, FileText as FileTextIcon, Users, Edit } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import React, { useState, useMemo, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Data KHS (sama seperti di halaman KHS untuk contoh ini)
const khsData: { [semester: string]: { courseId: string; courseName: string; credits: number; grade: string; score: number }[] } = {
  "1": [
    { courseId: "CS101", courseName: "Introduction to Programming", credits: 3, grade: "A", score: 90 },
    { courseId: "MA101", courseName: "Calculus I", credits: 4, grade: "A-", score: 85 },
    { courseId: "PH101", courseName: "Physics I", credits: 4, grade: "B+", score: 78 },
  ],
  "2": [
    { courseId: "CS201", courseName: "Data Structures", credits: 3, grade: "A", score: 92 },
    { courseId: "CS202", courseName: "Discrete Mathematics", credits: 3, grade: "B", score: 75 },
    { courseId: "EE201", courseName: "Digital Logic Design", credits: 3, grade: "A-", score: 88 },
  ],
  "3": [
    { courseId: "CS301", courseName: "Algorithms", credits: 3, grade: "B+", score: 80 },
    { courseId: "MA201", courseName: "Linear Algebra", credits: 3, grade: "A", score: 90 },
    { courseId: "ST202", courseName: "Probability & Statistics", credits: 3, grade: "A-", score: 86 },
  ],
   "4": [
    { courseId: "CS305", courseName: "Operating Systems", credits: 3, grade: "A", score: 91 },
    { courseId: "CS306", courseName: "Computer Networks", credits: 3, grade: "B", score: 77 },
    { courseId: "SE301", courseName: "Software Engineering", credits: 3, grade: "B+", score: 82 },
  ],
};

const gradeToWeight: { [grade: string]: number } = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "D": 1.0, "E": 0.0,
};

const chartConfig = {
  IPS: { label: "IPS", color: "hsl(var(--chart-1))" },
  IPK: { label: "IPK", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

// Summary cards untuk dashboard generik (admin)
const adminSummaryCards = [
  { title: "Total Students", value: "1,250", icon: Users, trend: "+50 this month", color: "text-green-500", href: "/admin/students" },
  { title: "Total Lecturers", value: "85", icon: GraduationCapIcon, trend: "+2 this month", href: "/admin/lecturers"  },
  { title: "Courses Offered", value: "120", icon: BookOpen, trend: "View All Courses", href: "/admin/courses" },
  { title: "Pending Approvals", value: "12", icon: Edit, trend: "Review Now", href: "/admin/approvals"},
];

// Summary cards untuk dashboard dosen
const dosenSummaryCards = [
  { title: "My Courses", value: "3", icon: BookOpen, trend: "View Schedule", href: "/schedule" },
  { title: "Students Enrolled", value: "78", icon: Users, trend: "Across all courses" },
  { title: "Upcoming Deadlines", value: "2", icon: CalendarCheck2, trend: "Next: Project Alpha - 30/07" },
  { title: "Recent Submissions", value: "15 New", icon: FileTextIcon, trend: "Grade Submissions" },
];


export default function DashboardPage() {
  const { user, initialLoading } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  
  useEffect(() => {
    const semesters = Object.keys(khsData);
    if (semesters.length > 0) {
      setSelectedSemester(semesters.sort((a,b) => parseInt(b) - parseInt(a))[0]);
    }
  }, []);

  const currentKHS = useMemo(() => khsData[selectedSemester] || [], [selectedSemester]);

  const calculateGPAForSemester = (khsEntries: typeof currentKHS) => {
    if (!khsEntries || khsEntries.length === 0) return { gpa: 0, totalCredits: 0 };
    let totalWeightedScore = 0;
    let totalCredits = 0;
    khsEntries.forEach(course => {
      totalWeightedScore += (gradeToWeight[course.grade] || 0) * course.credits;
      totalCredits += course.credits;
    });
    return { gpa: totalCredits > 0 ? (totalWeightedScore / totalCredits) : 0, totalCredits };
  };

  const { gpa: semesterGPA, totalCredits: semesterTotalCredits } = useMemo(() => calculateGPAForSemester(currentKHS), [currentKHS]);

  const progressChartData = useMemo(() => {
    const allSemesterKeys = Object.keys(khsData).sort((a, b) => parseInt(a) - parseInt(b));
    let cumulativeWeightedScore = 0;
    let cumulativeCredits = 0;
    
    return allSemesterKeys.map(semesterKey => {
      const semesterCourses = khsData[semesterKey];
      let semesterSpecificWeightedScore = 0;
      let semesterSpecificCredits = 0;

      if (semesterCourses && semesterCourses.length > 0) {
        semesterCourses.forEach(course => {
          const weight = gradeToWeight[course.grade] || 0;
          semesterSpecificWeightedScore += weight * course.credits;
          semesterSpecificCredits += course.credits;
          
          cumulativeWeightedScore += weight * course.credits;
          cumulativeCredits += course.credits;
        });
      }
      
      const ips = semesterSpecificCredits > 0 ? semesterSpecificWeightedScore / semesterSpecificCredits : 0;
      const ipk = cumulativeCredits > 0 ? cumulativeWeightedScore / cumulativeCredits : 0;
      
      return {
        semester: `Sem ${semesterKey}`,
        IPS: parseFloat(ips.toFixed(2)),
        IPK: parseFloat(ipk.toFixed(2)),
      };
    });
  }, []);

  if (initialLoading) {
    return (
      <>
        <AppHeader pageTitle="Dashboard" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-md mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full rounded-md" />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <Skeleton className="h-5 w-5 rounded-md" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-1/3 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md mt-1" />
                </CardContent>
              </Card>
            ))}
          </div>
           <div className="grid gap-6 md:grid-cols-1">
             <Card className="shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-1/4 rounded-md" />
                </CardHeader>
                <CardContent className="h-48">
                   <Skeleton className="h-full w-full rounded-md" />
                </CardContent>
              </Card>
           </div>
        </main>
      </>
    );
  }

  // MAHASISWA DASHBOARD
  if (user?.role === 'mahasiswa') {
    return (
      <>
        <AppHeader pageTitle="Dashboard Mahasiswa" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Selamat Datang, {user.email || 'Mahasiswa'}!</CardTitle>
              <CardDescription>Ringkasan performa akademik dan kemajuan belajarmu.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle className="font-headline text-xl">Kartu Hasil Studi (KHS)</CardTitle>
                  <CardDescription>Lihat nilai per semester.</CardDescription>
                </div>
                <div className="mt-4 md:mt-0">
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Pilih semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(khsData).sort((a,b) => parseInt(a) - parseInt(b)).map(semester => (
                        <SelectItem key={semester} value={semester}>Semester {semester}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {currentKHS.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kode MK</TableHead>
                        <TableHead>Nama Mata Kuliah</TableHead>
                        <TableHead className="text-center">SKS</TableHead>
                        <TableHead className="text-center">Nilai</TableHead>
                        <TableHead className="text-center">Huruf</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentKHS.map((item) => (
                        <TableRow key={item.courseId}>
                          <TableCell>{item.courseId}</TableCell>
                          <TableCell className="font-medium">{item.courseName}</TableCell>
                          <TableCell className="text-center">{item.credits}</TableCell>
                          <TableCell className="text-center">{item.score}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={item.grade.startsWith("A") ? "default" : item.grade.startsWith("B") ? "secondary" : "destructive"}
                              className={
                                item.grade.startsWith("A") ? "bg-green-500 hover:bg-green-600 text-white" :
                                item.grade.startsWith("B") ? "bg-blue-500 hover:bg-blue-600 text-white" :
                                "bg-red-500 hover:bg-red-600 text-white"
                              }
                            >
                              {item.grade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-6 flex flex-col md:flex-row justify-between items-center bg-muted p-4 rounded-md">
                    <p className="text-lg font-semibold">IP Semester {selectedSemester}: <span className="text-primary">{semesterGPA.toFixed(2)}</span></p>
                    <p className="text-md font-medium">Total SKS Diambil: <span className="text-primary">{semesterTotalCredits}</span></p>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center py-8">Data KHS tidak tersedia untuk semester ini.</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Grafik Kemajuan Belajar</CardTitle>
              <CardDescription>Perkembangan Indeks Prestasi Semester (IPS) dan Kumulatif (IPK).</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] md:h-[400px] w-full">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    accessibilityLayer
                    data={progressChartData}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="semester"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      domain={[0, 4]}
                      ticks={[0, 1, 2, 3, 4]}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Line
                      dataKey="IPS"
                      type="monotone"
                      stroke="var(--color-IPS)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--color-IPS)", strokeWidth: 0 }}
                      activeDot={{r: 6, strokeWidth: 0, style: { boxShadow: "0 0 0 4px hsl(var(--chart-1) / 0.2)" } }}
                    />
                    <Line
                      dataKey="IPK"
                      type="monotone"
                      stroke="var(--color-IPK)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--color-IPK)", strokeWidth: 0 }}
                      activeDot={{r: 6, strokeWidth: 0, style: { boxShadow: "0 0 0 4px hsl(var(--chart-2) / 0.2)" } }}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  // DOSEN DASHBOARD
  if (user?.role === 'dosen') {
    return (
      <>
        <AppHeader pageTitle="Dashboard Dosen" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Selamat Datang, Dosen {user.email || ''}!</CardTitle>
              <CardDescription>Ringkasan aktivitas dan manajemen perkuliahan Anda.</CardDescription>
            </CardHeader>
             <CardContent>
                 <p>Kelola kelas, nilai mahasiswa, dan materi perkuliahan Anda di sini.</p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dosenSummaryCards.map((item, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium font-headline">{item.title}</CardTitle>
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground pt-1">{item.trend}</p>
                   {item.href && (
                    <Button variant="link" size="sm" asChild className="px-0 h-auto mt-1">
                      <Link href={item.href}>
                        Lihat Detail <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
           <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Akses Cepat</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <CalendarCheck2 className="mr-2 h-4 w-4" /> Lihat Jadwal Mengajar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileTextIcon className="mr-2 h-4 w-4" /> Input Nilai Mahasiswa
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" /> Unggah Materi Kuliah
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="font-headline">Pengumuman Kampus</CardTitle>
                <CardDescription>Update dan acara terbaru.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Image src="https://placehold.co/80x80.png" alt="News" width={60} height={60} className="rounded-md" data-ai-hint="campus event" />
                  <div>
                    <h3 className="font-semibold">Rapat Dosen Bulanan</h3>
                    <p className="text-sm text-muted-foreground">Tanggal 5 Agustus, pukul 10:00 di Aula Rektorat.</p>
                    <Button variant="link" size="sm" className="px-0 h-auto">Info Detail <ArrowRight className="ml-1 h-3 w-3" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </>
    );
  }


  // GENERIC/ADMIN DASHBOARD
  return (
    <>
      <AppHeader pageTitle="Dashboard Admin" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Welcome Back, {user?.email || 'Admin'}!</CardTitle>
            <CardDescription>Overview of the academic information system.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Manage users, courses, and system settings from here.</p>
            {user?.role && <p className="mt-2 text-sm text-muted-foreground">Logged in as: <span className="font-semibold capitalize">{user.role}</span></p>}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {adminSummaryCards.map((item, index) => (
             <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium font-headline">{item.title}</CardTitle>
               <item.icon className="h-5 w-5 text-muted-foreground" />
             </CardHeader>
             <CardContent>
               <div className="text-2xl font-bold">{item.value}</div>
               <p className="text-xs text-muted-foreground pt-1">{item.trend}</p>
                {item.href && (
                <Button variant="link" size="sm" asChild className="px-0 h-auto mt-1">
                  <Link href={item.href}>
                    Manage <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
                )}
             </CardContent>
           </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Quick Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" /> Manage Users (Dosen/Mahasiswa)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" /> Manage Courses
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" /> Send System Announcement
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">System Activity Log</CardTitle>
              <CardDescription>Recent important system events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Placeholder for activity log items */}
              <p className="text-sm text-muted-foreground">New lecturer account 'prof.budi@example.com' created.</p>
              <p className="text-sm text-muted-foreground">Course 'CS101' details updated.</p>
              <p className="text-sm text-muted-foreground">Password reset requested for 'student.x@example.com'.</p>
               <Button variant="link" size="sm" className="px-0 h-auto">View Full Log <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
