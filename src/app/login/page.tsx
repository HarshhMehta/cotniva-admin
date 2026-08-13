import LoginForm from '@/forms/login-form';
import login_bg from '@assets/img/bg/login-bg.jpg';
import Link from 'next/link';
import BrandLogo from '@/layout/component/brand-logo';

const LoginPage = () => {
  return (
    <div className="tp-main-wrapper min-h-screen overflow-x-hidden">
      <div className="container mx-auto h-full flex items-center justify-center px-4">
        <div className="py-10 sm:py-[80px] w-full max-w-[920px]">
          <div className="grid grid-cols-12 shadow-lg bg-white overflow-hidden rounded-md">
            <div className="col-span-4 lg:col-span-6 relative h-full hidden lg:block">
              <div className="data-bg absolute top-0 left-0 w-full h-full bg-cover bg-no-repeat" data-bg="assets/img/bg/login-bg.jpg" style={{backgroundImage:`url(${login_bg.src})`}}></div>
            </div>
            <div className="col-span-12 lg:col-span-6 w-full max-w-[500px] mx-auto my-auto py-10 sm:py-[60px] px-5 md:px-[60px]">
              <div className="text-center mb-6">
                <div className="flex justify-center mb-5">
                  <BrandLogo href="/login" className="h-10 max-w-[160px]" />
                </div>
                <h4 className="text-[24px] mb-1">Login Now.</h4>
                <p>{"Don't"} have an account?  
                 <span> 
                    <Link href="/register" className="text-theme">Sign Up</Link> 
                  </span>
                </p>
              </div>
              <div className="">
                <LoginForm/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
