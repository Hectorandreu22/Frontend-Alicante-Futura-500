import ReviewsClient from "./ReviewsClient";
import { getReviews } from "@/lib/api";

export default async function ReviewsPage() {
  const reviews = await getReviews();
  return <ReviewsClient initialReviews={reviews} />;
}
