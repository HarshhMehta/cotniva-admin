"use client";
import React from "react";
import ErrorMsg from "../common/error-msg";
import Pagination from "../ui/Pagination";
import { useGetAllSlidersQuery, useDeleteSliderMutation } from "@/redux/slider/sliderApi";
import usePagination from "@/hooks/use-pagination";
import { notifyError, notifySuccess } from "@/utils/toast";
import Link from "next/link";

const SliderTable = () => {
  const { data: sliders, isError, isLoading } = useGetAllSlidersQuery();
  const [deleteSlider] = useDeleteSliderMutation();
  const paginationData = usePagination(sliders?.result || [], 5);
  const { currentItems, handlePageClick, pageCount } = paginationData;

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete?")) return;
    const res = await deleteSlider(id);
    if ("error" in res) return notifyError("Delete failed");
    notifySuccess("Slider deleted successfully");
  };

  let content = null;
  if (isLoading) content = <h2>Loading...</h2>;
  if (!isLoading && isError) content = <ErrorMsg msg="There was an error" />;
  if (!isLoading && !isError && sliders?.result.length === 0) content = <ErrorMsg msg="No Slider Found" />;

  if (!isLoading && !isError && currentItems) {
    content = (
      <>
        <table className="w-full text-base text-left text-gray-500">
          <thead>
            <tr className="border-b border-gray6 text-tiny">
              <th className="py-3 text-tiny text-text2 uppercase font-semibold w-[80px]">ID</th>
              <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">Image Preview</th>
              <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">Link</th>
              <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">Status</th>
              <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold">Order</th>
              <th className="px-3 py-3 text-tiny text-text2 uppercase font-semibold text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {[...currentItems].reverse().map((item) => (
              <tr key={item._id} className="bg-white border-b border-gray6 last:border-0">
                <td className="py-3 font-normal text-[#55585B] text-xs align-middle">
                  #{item._id?.slice(2, 10)}
                </td>
                <td className="px-3 py-3 align-middle">
                  {/* wide banner preview */}
                  <div style={{ width: 200, height: 75, overflow: "hidden", borderRadius: 6, background: "#f3f4f6" }}>
                    <img
                      src={item.img}
                      alt="slider"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
                    />
                  </div>
                </td>
                <td className="px-3 py-3 text-[#55585B] text-sm align-middle">{item.link || "/shop"}</td>
                <td className="px-3 py-3 align-middle">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#55585B] align-middle">{item.order}</td>
                <td className="px-3 py-3 text-end align-middle">
                  <div className="flex items-center justify-end space-x-2">
                    <Link href={`/slider/edit/${item._id}`} className="px-3 py-1 text-xs rounded bg-blue-50 text-blue-600 hover:bg-blue-100">Edit</Link>
                    <button onClick={() => handleDelete(item._id!)} className="px-3 py-1 text-xs rounded bg-red-50 text-red-500 hover:bg-red-100">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center flex-wrap mt-3">
          <p className="mb-0 text-tiny">Showing 1-{currentItems.length} of {sliders?.result.length}</p>
          <div className="pagination py-3 flex justify-end items-center">
            <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative overflow-x-auto bg-white px-8 py-4 rounded-md">
      {content}
    </div>
  );
};

export default SliderTable;
