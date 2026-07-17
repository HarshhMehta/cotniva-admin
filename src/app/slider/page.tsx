import React from "react";
import { Metadata } from "next";
import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import AddSlider from "../components/slider/add-slider";

export const metadata: Metadata = { title: "Slider Management" };

export default function SliderPage() {
  return (
    <Wrapper>
      <Breadcrumb title="Slider" subtitle="Slider" />
      <div className="body-content px-8 py-8 bg-slate-100">
        <AddSlider />
      </div>
    </Wrapper>
  );
}