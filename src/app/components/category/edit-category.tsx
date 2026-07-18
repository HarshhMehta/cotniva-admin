"use client";
import React from "react";
import useCategorySubmit from "@/hooks/useCategorySubmit";
import CategoryTables from "./category-tables";
import CategoryImgUpload from "./global-img-upload";
import { useGetCategoryQuery } from "@/redux/category/categoryApi";
import CategoryParent from "./category-parent";
import CategoryDescription from "./category-description";

const EditCategory = ({ id }: { id: string }) => {
  const { data: categoryData } = useGetCategoryQuery(id);
  const {
    errors,
    register,
    handleSubmit,
    setCategoryImg,
    categoryImg,
    isSubmitted,
    handleSubmitEditCategory,
  } = useCategorySubmit();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        {categoryData && (
          <form
            onSubmit={handleSubmit((data) =>
              handleSubmitEditCategory(data, id)
            )}
          >
            <div className="mb-6 bg-white px-8 py-8 rounded-md">
              <CategoryImgUpload
                isSubmitted={isSubmitted}
                setImage={setCategoryImg}
                default_img={categoryData.img}
                image={categoryImg}
              />

              <CategoryParent
                register={register}
                errors={errors}
                default_value={categoryData.parent}
              />

              <CategoryDescription
                register={register}
                default_value={categoryData.description}
              />

              <button className="tp-btn px-7 py-2">Edit Category</button>
            </div>
          </form>
        )}
      </div>
      <div className="col-span-12 lg:col-span-8">
        <CategoryTables />
      </div>
    </div>
  );
};

export default EditCategory;
