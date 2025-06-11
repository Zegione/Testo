import { AppHeader } from "@/components/layout/app-header";
import { RecommendationForm } from "./components/recommendation-form";

export default function CourseRecommendationsPage() {
  return (
    <>
      <AppHeader pageTitle="AI Course Recommendations" />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <RecommendationForm />
      </main>
    </>
  );
}
