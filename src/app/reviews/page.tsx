import Wrapper from "@/layout/wrapper";
import ReviewsArea from "../components/reviews/reviews-area";

const ReviewsPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-6 py-6 bg-[#f6f5f4] min-h-screen">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
            Commerce
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">Reviews</h1>
          <p className="text-sm text-slate-500 mt-1">
            Moderate verified product reviews from delivered orders
          </p>
        </div>
        <ReviewsArea />
      </div>
    </Wrapper>
  );
};

export default ReviewsPage;
