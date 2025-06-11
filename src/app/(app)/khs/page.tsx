"use client";

import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";

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
};

const gradeToWeight: { [grade: string]: number } = {
  "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "D": 1.0, "E": 0.0,
};

export default function KhsPage() {
  const [selectedSemester, setSelectedSemester] = useState<string>("1");
  const currentKHS = khsData[selectedSemester] || [];

  const calculateGPA = (khsEntries: typeof currentKHS) => {
    if (!khsEntries || khsEntries.length === 0) return { gpa: 0, totalCredits: 0 };
    let totalWeightedScore = 0;
    let totalCredits = 0;
    khsEntries.forEach(course => {
      totalWeightedScore += (gradeToWeight[course.grade] || 0) * course.credits;
      totalCredits += course.credits;
    });
    return { gpa: totalCredits > 0 ? (totalWeightedScore / totalCredits) : 0, totalCredits };
  };

  const { gpa, totalCredits } = calculateGPA(currentKHS);

  return (
    <>
      <AppHeader pageTitle="Kartu Hasil Studi (KHS)" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Academic Performance</CardTitle>
            <CardDescription>Review your grades for each semester.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(khsData).map(semester => (
                    <SelectItem key={semester} value={semester}>Semester {semester}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentKHS.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
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
                          <Badge variant={item.grade.startsWith("A") ? "default" : item.grade.startsWith("B") ? "secondary" : "destructive"} 
                                 className={item.grade.startsWith("A") ? "bg-green-500 hover:bg-green-600 text-white" : item.grade.startsWith("B") ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}>
                            {item.grade}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 flex flex-col md:flex-row justify-between items-center bg-muted p-4 rounded-md">
                  <p className="text-lg font-semibold">Semester {selectedSemester} GPA: <span className="text-primary">{gpa.toFixed(2)}</span></p>
                  <p className="text-md font-medium">Total Credits Taken: <span className="text-primary">{totalCredits}</span></p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">No KHS data available for this semester.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
