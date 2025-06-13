
// import { AppHeader } from "@/components/layout/app-header"; // Removed, layout handles header
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import Image from "next/image";

const student = {
  name: "John Doe",
  studentId: "123456789",
  faculty: "Engineering",
  major: "Computer Science",
  email: "john.doe@example.com",
  phone: "081234567890",
  address: "123 Main Street, Anytown, ID",
  avatarUrl: "https://placehold.co/150x150.png",
  sklUrl: "https://placehold.co/800x1100.png",
  stijazahUrl: "https://placehold.co/800x1100.png",
};

export default function StudentDataPage() {
  return (
    <>
      {/* AppHeader is now rendered by the layout */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <Tabs defaultValue="biodata" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex mb-6 shadow-sm">
            <TabsTrigger value="biodata">Profile</TabsTrigger>
            <TabsTrigger value="skl">Graduation Certificate (SKL)</TabsTrigger>
            <TabsTrigger value="stijazah">Diploma Acceptance (STI)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="biodata">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-col md:flex-row items-center gap-4">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary">
                  <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="student portrait" />
                  <AvatarFallback>{student.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-headline">{student.name}</CardTitle>
                  <CardDescription>Student ID: {student.studentId}</CardDescription>
                  <CardDescription>{student.major}, {student.faculty}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{student.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p>{student.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p>{student.address}</p>
                </div>
              </CardContent>
            </Card>
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
                   <Image src={student.sklUrl} alt="SKL Document" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="official document" />
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
                  <Image src={student.stijazahUrl} alt="STI Document" width={800} height={1131} className="w-full h-full object-contain" data-ai-hint="certificate diploma" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
