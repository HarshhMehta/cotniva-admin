import React from "react";
import ReactSelect from "react-select";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useUpdateStatusMutation } from "@/redux/order/orderApi";
import { nextStatusOptions, STATUS_LABELS } from "@/utils/order-status";

const OrderStatusChange = ({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus?: string;
}) => {
  const [updateStatus] = useUpdateStatusMutation();
  const options = nextStatusOptions(currentStatus);

  const handleChange = async (value: string | undefined) => {
    if (!value) return;
    const res = await updateStatus({ id, status: { status: value } });
    if ("data" in res && res.data?.message) {
      notifySuccess(res.data.message);
    } else if ("error" in res) {
      const err = res.error as { data?: { message?: string } };
      notifyError(err?.data?.message || "Could not update status");
    }
  };

  if (!options.length) {
    return (
      <span className="text-xs text-slate-400">
        {STATUS_LABELS[String(currentStatus || "").toLowerCase()] ||
          currentStatus ||
          "—"}
      </span>
    );
  }

  return (
    <ReactSelect
      placeholder="Next status"
      onChange={(value) => handleChange(value?.value)}
      options={options}
      className="min-w-[140px] text-sm"
    />
  );
};

export default OrderStatusChange;
