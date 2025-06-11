// use server'

/**
 * @fileOverview An AI agent that recommends courses to students based on their academic history and performance.
 *
 * - recommendCourses - A function that handles the course recommendation process.
 * - CourseRecommendationInput - The input type for the recommendCourses function.
 * - CourseRecommendationOutput - The return type for the recommendCourses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CourseRecommendationInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  academicTranscript: z.string().describe('The academic transcript of the student, including course names, grades, and credits.'),
  interests: z.string().describe('The stated interests of the student.'),
});
export type CourseRecommendationInput = z.infer<typeof CourseRecommendationInputSchema>;

const CourseRecommendationOutputSchema = z.object({
  recommendedCourses: z.array(
    z.object({
      courseName: z.string().describe('The name of the recommended course.'),
      description: z.string().describe('A brief description of the course.'),
      rationale: z.string().describe('The rationale for recommending this course to the student.'),
    })
  ).describe('A list of recommended courses for the student.'),
});
export type CourseRecommendationOutput = z.infer<typeof CourseRecommendationOutputSchema>;

export async function recommendCourses(input: CourseRecommendationInput): Promise<CourseRecommendationOutput> {
  return recommendCoursesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'courseRecommendationPrompt',
  input: {schema: CourseRecommendationInputSchema},
  output: {schema: CourseRecommendationOutputSchema},
  prompt: `You are an AI-powered course recommendation system designed to suggest courses to students based on their academic history, performance, and interests.

  Analyze the student's academic transcript and interests to identify potential courses that align with their strengths and areas for improvement.
  Provide a rationale for each recommended course, explaining how it can benefit the student's academic and career goals.

  Student ID: {{{studentId}}}
  Academic Transcript: {{{academicTranscript}}}
  Interests: {{{interests}}}

  Based on this information, recommend a list of courses that the student should consider taking.
  Ensure each course includes a description and a rationale explaining why it is being recommended.
  `,  
});

const recommendCoursesFlow = ai.defineFlow(
  {
    name: 'recommendCoursesFlow',
    inputSchema: CourseRecommendationInputSchema,
    outputSchema: CourseRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
