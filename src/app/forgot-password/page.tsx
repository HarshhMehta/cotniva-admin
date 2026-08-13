import ForgotForm from "../components/forgot/forgot-form";
import BrandLogo from "@/layout/component/brand-logo";

const ForgetPage = () => {
  return (
    <div className="tp-main-wrapper min-h-screen overflow-x-hidden">
      <div className="container mx-auto h-full flex items-center justify-center px-4">
        <div className="w-full max-w-[500px] mx-auto my-auto shadow-lg bg-white py-10 sm:py-[60px] px-5 sm:px-[60px] rounded-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-5">
              <BrandLogo href="/login" className="h-10 max-w-[160px]" />
            </div>
            <h4 className="text-[24px] mb-1">Reset Password</h4>
            <p>Enter your email address to request password reset.</p>
          </div>
          <div className="">
            <ForgotForm/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgetPage;
