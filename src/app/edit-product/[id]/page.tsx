import Wrapper from "@/layout/wrapper";
import EditProductSubmit from "@/app/components/products/edit-product/edit-product-submit";

const EditProduct = ({ params }: { params: { id: string } }) => {
  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100">

        {/* add a product start */}
        <div className="grid grid-cols-12">
          <div className="col-span-12 2xl:col-span-10">
            <EditProductSubmit id={params.id} />
          </div>
        </div>
        {/* add a product end */}
      </div>
    </Wrapper>
  );
};

export default EditProduct;
