
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CourseRecommendationOutput } from "@/ai/flows/course-recommendations"; // CourseRecommendationInput is implicitly used via formSchema
import { getRecommendationsAction } from "../actions"; // Import the server action
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// This schema should align with CourseRecommendationInput from the flow
const formSchema = z.object({
  studentId: z.string().min(1, "Student ID is required."),
  academicTranscript: z.string().min(10, "Academic transcript is required and should be detailed."),
  interests: z.string().min(5, "Please describe your interests."),
});

type RecommendationFormValues = z.infer<typeof formSchema>;


export function RecommendationForm() {
  const [recommendations, setRecommendations] = useState<CourseRecommendationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "S12345", // Sample data
      academicTranscript: "Semester 1:\nCalculus I - A (4 credits)\nIntroduction to Programming - A (3 credits)\nPhysics I - B+ (4 credits)\n\nSemester 2:\nData Structures - A (3 credits)\nDiscrete Mathematics - B (3 credits)", // Sample data
      interests: "Artificial Intelligence, Web Development, Problem Solving", // Sample data
    },
  });

  async function onSubmit(data: RecommendationFormValues) {
    setIsLoading(true);
    setRecommendations(null);
    // Call the imported server action
    const result = await getRecommendationsAction(data);
    setIsLoading(false);

    if ("error" in result) {
       toast({
        title: "Error",
        description: `Failed to get recommendations: ${result.error}`,
        variant: "destructive",
      });
    } else if (result.recommendedCourses && result.recommendedCourses.length > 0) {
      setRecommendations(result);
      toast({
        title: "Success!",
        description: "Course recommendations generated.",
      });
    } else {
       toast({
        title: "No Recommendations",
        description: "The AI couldn't find specific recommendations based on the input.",
      });
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Get AI Course Recommendations</CardTitle>
          <CardDescription>
            Enter your details and let our AI suggest courses tailored to your academic profile and interests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., S12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="academicTranscript"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Transcript</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your academic transcript here, including course names, grades, and credits..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide as much detail as possible for better recommendations.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your academic and career interests, e.g., AI, software development, data science..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get Recommendations
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-muted-foreground">Generating recommendations...</p>
        </div>
      )}

      {recommendations && recommendations.recommendedCourses.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Recommended Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.recommendedCourses.map((course, index) => (
              <Card key={index} className="bg-background/50">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">{course.courseName}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">Rationale:</p>
                  <p className="text-sm text-muted-foreground">{course.rationale}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
