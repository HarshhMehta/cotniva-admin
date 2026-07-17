"use client";
import React from "react";
import ErrorMsg from "../../common/error-msg";
import { useGetProductQuery } from "@/redux/product/productApi";
import ProductForm from "../add-product/product-submit";

const EditProductSubmit = ({ id }: { id: string }) => {
  const { data: product, isError, isLoading } = useGetProductQuery(id,{
    refetchOnMountOrArgChange: true,
  });

  // decide what to render
  let content = null;

  if (isLoading) {
    content = <h2>Loading....</h2>;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && product) {
    content = (
      <ProductForm productEdit={product} />
    );
  }

  return <>{content}</>;
};

export default EditProductSubmit;
