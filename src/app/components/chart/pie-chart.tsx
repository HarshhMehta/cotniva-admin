import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useGetMostSellingCategoryQuery } from "@/redux/order/orderApi";
import ErrorMsg from "../common/error-msg";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#4a1f1a",
  "#8b5a4a",
  "#50CD89",
  "#F1416C",
  "#ff9800",
  "#7239EA",
  "#0ea5e9",
  "#64748b",
];

const PieChart = () => {
  const {
    data: sellingCategory,
    isError,
    isLoading,
  } = useGetMostSellingCategoryQuery();

  let content = null;

  if (isLoading) {
    content = (
      <p className="text-sm text-textBody m-0 py-10 text-center">Loading…</p>
    );
  } else if (isError) {
    content = <ErrorMsg msg="Could not load category sales" />;
  } else if (!sellingCategory?.categoryData?.length) {
    content = (
      <p className="text-sm text-textBody m-0 py-10 text-center">
        No category sales yet. Orders with products will show here.
      </p>
    );
  } else {
    const rows = sellingCategory.categoryData.filter(
      (c) => c?._id && String(c._id).trim()
    );
    const data = {
      labels: rows.map((c) => String(c._id)),
      datasets: [
        {
          label: "Units sold",
          data: rows.map((c) => c.count),
          backgroundColor: rows.map((_, i) => COLORS[i % COLORS.length]),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
    };

    content = (
      <div className="mx-auto md:!w-[240px] md:!h-[240px] 2xl:!w-[360px] 2xl:!h-[380px]">
        <Pie
          data={data}
          options={{
            plugins: {
              legend: {
                position: "bottom",
                labels: { boxWidth: 12, padding: 14, font: { size: 12 } },
              },
            },
            maintainAspectRatio: true,
          }}
        />
      </div>
    );
  }

  return <div className="md:h-[252px] 2xl:h-[454px] w-full">{content}</div>;
};

export default PieChart;
