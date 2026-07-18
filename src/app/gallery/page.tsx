import React from "react";
import { Metadata } from "next";
import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import AddGallery from "../components/gallery/add-gallery";

export const metadata: Metadata = { title: "Gallery Management" };

export default function GalleryPage() {
  return (
    <Wrapper>
      <Breadcrumb title="Our Gallery" subtitle="Gallery" />
      <div className="body-content px-8 py-8 bg-slate-100">
        <AddGallery />
      </div>
    </Wrapper>
  );
}
