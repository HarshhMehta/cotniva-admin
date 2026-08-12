import Wrapper from "@/layout/wrapper";
import CustomerArea from "../components/customers/customer-area";

const CustomersPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-6 py-6 bg-[#f6f5f4] min-h-screen">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
            Commerce
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">
            Customers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Customer profiles, orders and activity foundation
          </p>
        </div>
        <CustomerArea />
      </div>
    </Wrapper>
  );
};

export default CustomersPage;
