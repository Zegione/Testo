import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, BookOpen, CalendarCheck2, TrendingUp, FileText, GraduationCap } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const summaryCards = [
    { title: "Overall GPA", value: "3.75", icon: TrendingUp, trend: "+0.12 this semester", color: "text-green-500" },
    { title: "Courses Enrolled", value: "5", icon: BookOpen, trend: "View Details" },
    { title: "Upcoming Exams", value: "2", icon: CalendarCheck2, trend: "Next: Math IA - 23/07" },
    { title: "Recent Announcements", value: "3 New", icon: Bell, trend: "Check Announcements" },
  ];

  return (
    <>
      <AppHeader pageTitle="Dashboard" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Welcome Back, Student!</CardTitle>
            <CardDescription>Here's a quick overview of your academic progress.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Stay updated with your courses, schedules, and grades. Use the sidebar to navigate to different sections.</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((item, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium font-headline">{item.title}</CardTitle>
                <item.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
                <p className="text-xs text-muted-foreground pt-1">{item.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CalendarCheck2 className="mr-2 h-4 w-4" /> View Full Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" /> Submit Assignments
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" /> Check Grades
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Campus News</CardTitle>
              <CardDescription>Latest updates and events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Image src="https://placehold.co/80x80.png" alt="News" width={60} height={60} className="rounded-md" data-ai-hint="campus event" />
                <div>
                  <h3 className="font-semibold">New Library Wing Opening</h3>
                  <p className="text-sm text-muted-foreground">Join us for the grand opening on August 1st!</p>
                  <Button variant="link" size="sm" className="px-0 h-auto">Read More <ArrowRight className="ml-1 h-3 w-3" /></Button>
                </div>
              </div>
               <div className="flex items-start gap-3">
                <Image src="https://placehold.co/80x80.png" alt="Workshop" width={60} height={60} className="rounded-md" data-ai-hint="students workshop" />
                <div>
                  <h3 className="font-semibold">AI Workshop Next Week</h3>
                  <p className="text-sm text-muted-foreground">Limited spots available. Register now!</p>
                  <Button variant="link" size="sm" className="px-0 h-auto">Register <ArrowRight className="ml-1 h-3 w-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
