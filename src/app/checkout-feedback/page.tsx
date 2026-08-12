import Wrapper from "@/layout/wrapper";
import CheckoutFeedbackArea from "@/components/checkout-feedback/checkout-feedback-area";

const CheckoutFeedbackPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-6 py-6 bg-[#f6f5f4] min-h-screen">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
            Insights
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">
            Checkout Feedback
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Why customers cancel Razorpay / leave checkout without buying
          </p>
        </div>
        <CheckoutFeedbackArea />
      </div>
    </Wrapper>
  );
};

export default CheckoutFeedbackPage;
