"use client";
import React, { useState } from "react";
import ErrorMsg from "../common/error-msg";
import TableItem from "./table-item";
import TableHead from "./table-head";
import Pagination from "../ui/Pagination";
import { useGetRecentOrdersQuery } from "@/redux/order/orderApi";
import usePagination from "@/hooks/use-pagination";

const RecentOrders = () => {
  const { data: recentOrders, isError, isLoading } = useGetRecentOrdersQuery();
  const paginationData = usePagination(recentOrders?.orders || [], 5);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <h2>Loading....</h2>;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }

  if (!isLoading && !isError && currentItems) {
    content = (
      <>
        <table className="w-full text-base text-left text-gray-500">
          <TableHead />
          <tbody>
            {currentItems?.map((order) => (
                <TableItem key={order._id} order={order} />
              ))}
          </tbody>
        </table>
        {/*  */}
        <div className="px-4 pt-6 border-t border-gray6">
          <div className="flex flex-col justify-between sm:flex-row pagination">
          <span className="flex items-center uppercase">Showing 1-{currentItems.length} of {recentOrders?.orders.length}</span>
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
            />
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <div className="grid grid-cols-12 gap-4 mb-5">
        <div className="bg-white p-4 sm:p-5 col-span-12 xl:col-span-12 2xl:col-span-12 rounded-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium tracking-wide text-slate-700 text-base mb-0 leading-none">
              Recent Orders
            </h3>
            <a
              href="/orders"
              className="leading-none text-base text-theme border-b border-theme border-dotted capitalize font-medium hover:text-theme/60 hover:border-theme/60"
            >
              View All
            </a>
          </div>

          {/* table */}
          <div className="overflow-scroll 2xl:overflow-visible">
            <div className="w-[700px] 2xl:w-full">{content}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentOrders;
