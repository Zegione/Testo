
"use client";

// import { AppHeader } from "@/components/layout/app-header"; // Removed, layout handles header
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Trash2, Save } from "lucide-react";
import React, { useState } from 'react';

const availableCourses = [
  { id: "CS101", name: "Introduction to Programming", credits: 3, semester: 1 },
  { id: "MA101", name: "Calculus I", credits: 4, semester: 1 },
  { id: "PH101", name: "Physics I", credits: 4, semester: 1 },
  { id: "CS201", name: "Data Structures", credits: 3, semester: 2 },
  { id: "CS202", name: "Discrete Mathematics", credits: 3, semester: 2 },
  { id: "EE201", name: "Digital Logic Design", credits: 3, semester: 2 },
];

interface SelectedCourse {
  id: string;
  name: string;
  credits: number;
}

export default function KrsPage() {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [currentSemester, setCurrentSemester] = useState<string>("1"); // Default to semester 1

  const handleCourseSelection = (courseId: string, checked: boolean | "indeterminate") => {
    const course = availableCourses.find(c => c.id === courseId);
    if (!course) return;

    if (checked) {
      setSelectedCourses(prev => [...prev, { id: course.id, name: course.name, credits: course.credits }]);
    } else {
      setSelectedCourses(prev => prev.filter(c => c.id !== courseId));
    }
  };

  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);

  const handleSubmitKRS = () => {
    // Mock submission
    console.log("KRS Submitted:", selectedCourses);
    alert(`KRS for Semester ${currentSemester} submitted with ${totalCredits} credits.`);
  };
  
  const filteredAvailableCourses = availableCourses.filter(course => course.semester.toString() === currentSemester);

  return (
    <>
      {/* AppHeader is now rendered by the layout */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Kartu Rencana Studi (KRS)</CardTitle>
            <CardDescription>Plan your courses for the upcoming semester.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <Label htmlFor="semester">Select Semester</Label>
              <Select value={currentSemester} onValueChange={(value) => {
                setCurrentSemester(value);
                setSelectedCourses([]); // Reset selected courses when semester changes
              }}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Semester 1</SelectItem>
                  <SelectItem value="2">Semester 2</SelectItem>
                  <SelectItem value="3">Semester 3</SelectItem>
                  {/* Add more semesters as needed */}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg">Available Courses for Semester {currentSemester}</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAvailableCourses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Course ID</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAvailableCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>
                            <Checkbox
                              id={`course-${course.id}`}
                              checked={selectedCourses.some(sc => sc.id === course.id)}
                              onCheckedChange={(checked) => handleCourseSelection(course.id, checked)}
                            />
                          </TableCell>
                          <TableCell>{course.id}</TableCell>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell className="text-right">{course.credits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No courses available for this semester or all courses selected.</p>
                )}
              </CardContent>
            </Card>
            
            {selectedCourses.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Selected Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course ID</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-right">Credits</TableHead>
                        <TableHead className="text-right w-[50px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.id}</TableCell>
                          <TableCell className="font-medium">{course.name}</TableCell>
                          <TableCell className="text-right">{course.credits}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleCourseSelection(course.id, false)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4 text-right font-semibold">
                    Total Credits: {totalCredits}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-8 flex justify-end">
              <Button size="lg" onClick={handleSubmitKRS} disabled={selectedCourses.length === 0}>
                <Save className="mr-2 h-5 w-5" /> Submit KRS
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
