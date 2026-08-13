"use client";
import React from "react";
import LineChart from "../chart/line-chart";
import PieChart from "../chart/pie-chart";

const SalesReport = () => {
 
  return (
    <>
      <div className="chart-main-wrapper mb-5 grid grid-cols-12 gap-4">
        <div className=" col-span-12 2xl:col-span-7">
          <div className="chart-single bg-white py-3 px-3 sm:py-5 sm:px-5 h-fit rounded-md">
            <h3 className="text-lg mb-3">Sales Statistics</h3>
            <LineChart/>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6 2xl:col-span-5 space-y-4">
          <div className="chart-widget bg-white p-4 sm:p-5 rounded-md">
            <h3 className="text-lg mb-2">Most Selling Category</h3>
            <p className="text-tiny text-textBody mb-4">
              Based on your Cotniva product categories
            </p>
            <PieChart/>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesReport;
