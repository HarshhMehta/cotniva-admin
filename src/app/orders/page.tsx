import { Suspense } from "react";
import Wrapper from "@/layout/wrapper";
import OrderArea from "../components/orders/order-area";

const OrdersPage = () => {
  return (
    <Wrapper>
      <div className="body-content px-6 py-6 bg-[#f6f5f4] min-h-screen">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
            Commerce
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 mt-1">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage payments, fulfillment and customer details
          </p>
        </div>
        <Suspense fallback={<div className="text-sm text-slate-500">Loading orders…</div>}>
          <OrderArea />
        </Suspense>
      </div>
    </Wrapper>
  );
};

export default OrdersPage;
