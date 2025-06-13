
import { RecommendationForm } from "./components/recommendation-form";
// import { AppHeader } from "@/components/layout/app-header"; // Removed, layout handles header

export default function CourseRecommendationsPage() {
  return (
    <>
      {/* AppHeader is now rendered by the layout */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <RecommendationForm />
      </main>
    </>
  );
}
