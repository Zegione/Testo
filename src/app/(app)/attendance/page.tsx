
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React from 'react';

interface AttendanceRecord {
  id: string;
  classCode: string;
  courseName: string;
  studentPresence: number;
  lecturerPresence: number;
  totalMeetings: number;
  absentMeetings: number[]; // Array of meeting numbers where student was absent
}

const mockAttendanceData: AttendanceRecord[] = [
  {
    id: "1",
    classCode: "CS101-A",
    courseName: "Introduction to Programming",
    studentPresence: 14,
    lecturerPresence: 15,
    totalMeetings: 16,
    absentMeetings: [3, 7],
  },
  {
    id: "2",
    classCode: "MA101-B",
    courseName: "Calculus I",
    studentPresence: 15,
    lecturerPresence: 16,
    totalMeetings: 16,
    absentMeetings: [10],
  },
  {
    id: "3",
    classCode: "PH101-C",
    courseName: "Physics I",
    studentPresence: 12,
    lecturerPresence: 14,
    totalMeetings: 16,
    absentMeetings: [2, 5, 8, 12],
  },
  {
    id: "4",
    classCode: "CS201-A",
    courseName: "Data Structures",
    studentPresence: 16,
    lecturerPresence: 16,
    totalMeetings: 16,
    absentMeetings: [],
  },
];

export default function AttendancePage() {
  const calculatePresencePercentage = (studentPresence: number, totalMeetings: number) => {
    if (totalMeetings === 0) return "0.00%";
    return ((studentPresence / totalMeetings) * 100).toFixed(2) + "%";
  };

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Absensi Perkuliahan</CardTitle>
          <CardDescription>Rincian kehadiran Anda dalam setiap mata kuliah.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockAttendanceData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">No.</TableHead>
                  <TableHead>Kode Kelas</TableHead>
                  <TableHead>Nama Mata Kuliah</TableHead>
                  <TableHead className="text-center">Presensi Mahasiswa</TableHead>
                  <TableHead className="text-center">Presensi Dosen</TableHead>
                  <TableHead className="text-center">% Presensi Mahasiswa</TableHead>
                  <TableHead>Ketidakhadiran (Pertemuan Ke-)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttendanceData.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>
                    <TableCell>{item.classCode}</TableCell>
                    <TableCell className="font-medium">{item.courseName}</TableCell>
                    <TableCell className="text-center">{item.studentPresence}/{item.totalMeetings}</TableCell>
                    <TableCell className="text-center">{item.lecturerPresence}/{item.totalMeetings}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant={parseFloat(calculatePresencePercentage(item.studentPresence, item.totalMeetings)) >= 80 ? "default" : "destructive"}
                        className={
                            parseFloat(calculatePresencePercentage(item.studentPresence, item.totalMeetings)) >= 80 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-red-500 hover:bg-red-600 text-white"
                        }
                      >
                        {calculatePresencePercentage(item.studentPresence, item.totalMeetings)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.absentMeetings.length > 0 ? item.absentMeetings.join(", ") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-8">Data absensi tidak tersedia.</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
