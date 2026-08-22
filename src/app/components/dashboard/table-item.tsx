import React from "react";
import dayjs from "dayjs";
import { IOrder } from "@/types/order-amount-type";
import OrderActions from "../orders/order-actions";
import OrderStatusChange from "../orders/status-change";
import { formatINR } from "@/utils/format-inr";
import { STATUS_LABELS, statusBadgeClass } from "@/utils/order-status";

const TableItem = (props: { order: IOrder }) => {
  const { order } = props;
  const p_method =
    order.paymentMethod === "COD"
      ? "Cash"
      : order.paymentMethod === "Card"
      ? "Card"
      : order.paymentMethod;
  const statusKey = String(order.status || "").toLowerCase();
  return (
    <tr className="bg-white border-b border-gray6 last:border-0 text-start">
      <td className="px-3 py-3">#{order.invoice}</td>
      <td className="px-3 py-3">
        {dayjs(order.updatedAt).format("MMMM D, YYYY h:mm A")}
      </td>
      <td className="px-3 py-3">{order.name}</td>
      <td className="px-3 py-3">{p_method}</td>
      <td className="px-3 py-3">{formatINR(order.totalAmount)}</td>
      <td className="px-3 py-3">
        <span
          className={`text-[11px] px-3 py-1 rounded-md leading-none ${statusBadgeClass(
            order.status
          )} font-medium`}
        >
          {STATUS_LABELS[statusKey] || order.status}
        </span>
      </td>
      <td className="px-3 py-3">
        <OrderStatusChange id={order._id} currentStatus={order.status} />
      </td>
      <OrderActions id={order._id} cls="px-3 py-3" />
    </tr>
  );
};

export default TableItem;
