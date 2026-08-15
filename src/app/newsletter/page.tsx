import Wrapper from "@/layout/wrapper";
import NewsletterArea from "../components/newsletter/newsletter-area";

const NewsletterPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-6 py-6 bg-[#f6f5f4] min-h-screen">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
            Marketing
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">
            Newsletter
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage subscribers and send Cotniva campaign emails
          </p>
        </div>
        <NewsletterArea />
      </div>
    </Wrapper>
  );
};

export default NewsletterPage;
