"use client";
import React from "react";
import useCategorySubmit from "@/hooks/useCategorySubmit";
import CategoryTables from "./category-tables";
import CategoryImgUpload from "./global-img-upload";
import CategoryParent from "./category-parent";
import CategoryDescription from "./category-description";

const AddCategory = () => {
  const {
    errors,
    register,
    handleSubmit,
    handleSubmitCategory,
    setCategoryImg,
    categoryImg,
    isSubmitted,
  } = useCategorySubmit();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <form onSubmit={handleSubmit(handleSubmitCategory)}>
          <div className="mb-6 bg-white px-8 py-8 rounded-md">
            <CategoryImgUpload
              isSubmitted={isSubmitted}
              setImage={setCategoryImg}
              image={categoryImg}
            />

            <CategoryParent register={register} errors={errors} />

            <CategoryDescription register={register} />

            <button className="tp-btn px-7 py-2">Add Category</button>
          </div>
        </form>
      </div>
      <div className="col-span-12 lg:col-span-8">
        <CategoryTables />
      </div>
    </div>
  );
};

export default AddCategory;
