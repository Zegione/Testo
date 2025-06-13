
// import { AppHeader } from "@/components/layout/app-header"; // Removed, layout handles header
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock } from "lucide-react";

const lectureSchedule = [
  { day: "Monday", time: "08:00 - 10:00", course: "Calculus I", room: "A-101", lecturer: "Dr. Smith" },
  { day: "Monday", time: "10:00 - 12:00", course: "Introduction to Programming", room: "B-203", lecturer: "Prof. Jones" },
  { day: "Tuesday", time: "13:00 - 15:00", course: "Physics I", room: "C-305", lecturer: "Dr. Brown" },
  { day: "Wednesday", time: "08:00 - 10:00", course: "Calculus I", room: "A-101", lecturer: "Dr. Smith" },
  { day: "Thursday", time: "10:00 - 12:00", course: "Introduction to Programming", room: "B-203", lecturer: "Prof. Jones" },
  { day: "Friday", time: "13:00 - 15:00", course: "Physics I", room: "C-305", lecturer: "Dr. Brown" },
];

const examSchedule = [
  { date: "2024-07-23", time: "09:00 - 11:00", course: "Calculus I Midterm", room: "Hall A", type: "Midterm" },
  { date: "2024-07-25", time: "14:00 - 16:00", course: "Physics I Quiz", room: "C-305", type: "Quiz" },
  { date: "2024-08-10", time: "09:00 - 12:00", course: "Introduction to Programming Final", room: "Hall B", type: "Final" },
];

export default function SchedulePage() {
  return (
    <>
      {/* AppHeader is now rendered by the layout */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="lectures" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex mb-6 shadow-sm">
            <TabsTrigger value="lectures">
              <CalendarDays className="mr-2 h-4 w-4" /> Lecture Schedule
            </TabsTrigger>
            <TabsTrigger value="exams">
              <Clock className="mr-2 h-4 w-4" /> Exam Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lectures">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Weekly Lecture Schedule</CardTitle>
                <CardDescription>Your class timetable for the current semester.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Lecturer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lectureSchedule.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.day}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell>{item.course}</TableCell>
                        <TableCell>{item.room}</TableCell>
                        <TableCell>{item.lecturer}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline">Upcoming Exam Schedule</CardTitle>
                <CardDescription>Dates and times for your upcoming exams and quizzes.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Course / Exam Name</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examSchedule.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.date}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell>{item.course}</TableCell>
                        <TableCell>{item.room}</TableCell>
                        <TableCell>{item.type}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
