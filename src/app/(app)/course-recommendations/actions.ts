
"use server";

import { recommendCourses, CourseRecommendationInput, CourseRecommendationOutput } from "@/ai/flows/course-recommendations";

export async function getRecommendationsAction(data: CourseRecommendationInput): Promise<CourseRecommendationOutput | { error: string }> {
  try {
    const result = await recommendCourses(data);
    return result;
  } catch (error) {
    console.error("Error getting recommendations in server action:", error);
    // It's good practice to provide a generic error message to the client for unexpected errors
    return { error: error instanceof Error ? error.message : "An AI processing error occurred. Please try again." };
  }
}
