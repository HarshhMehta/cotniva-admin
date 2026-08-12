import { IProduct } from "./product-type";

export interface IUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  contactNumber?: string;
  password?: string;
  imageURL?: string;
  role?: string;
  status?: string;
  reviews?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IPaymentIntent {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  gateway?: string;
  shipping_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    country?: string;
    name?: string;
    contact?: string;
    [key: string]: unknown;
  } | null;
  customer_details?: Record<string, unknown> | null;
  shipping_fee?: number | null;
  cod_fee?: number | null;
  address_synced_at?: string;
  [key: string]: unknown;
}

export interface IOrderCartItem extends Omit<IProduct, "img" | "imageURLs"> {
  selectedSize?: string;
  orderQuantity: number;
  img?: string;
  imageURLs?: { img?: string; isDefault?: boolean }[];
  discount?: number;
}

export interface Order {
  _id: string;
  user: IUser | string;
  cart: IOrderCartItem[];
  name: string;
  address: string;
  email: string;
  contact: string;
  city: string;
  country: string;
  zipCode: string;
  subTotal: number;
  shippingCost: number;
  discount?: number;
  totalAmount: number;
  shippingOption: string;
  paymentMethod: string;
  orderNote?: string;
  adminNotes?: string;
  paymentIntent?: IPaymentIntent;
  cardInfo?: Record<string, unknown>;
  invoice: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Narrow order.user when API returns populated user vs id string */
export function getOrderUser(user: Order["user"] | undefined | null): IUser | null {
  if (user && typeof user === "object") return user;
  return null;
}

export function getOrderCustomerName(order: Pick<Order, "user" | "name">): string {
  return getOrderUser(order.user)?.name || order.name || "Guest";
}

export interface IOrderAmounts {
  todayOrderAmount: number;
  yesterdayOrderAmount: number;
  monthlyOrderAmount: number;
  totalOrderAmount: number;
  todayCardPaymentAmount: number;
  todayCashPaymentAmount: number;
  yesterDayCardPaymentAmount: number;
  yesterDayCashPaymentAmount: number;
}

export interface ISalesEntry {
  date: string;
  total: number;
  order: number;
}

export interface ISalesReport {
  salesReport: ISalesEntry[];
}

export interface IMostSellingCategory {
  categoryData: {
    _id: string;
    count: number;
  }[];
}

export interface IOrder {
  _id: string;
  user: string;
  name: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  invoice: number;
}

export interface IDashboardRecentOrders {
  orders: IOrder[];
  totalOrder: number;
}

export interface IGetAllOrdersRes {
  success: boolean;
  data: Order[];
}

export interface IUpdateStatusOrderRes {
  success: boolean;
  message: string;
}
