
export interface ICoupon {
  _id: string;
  title: string;
  logo: string;
  couponCode: string;
  endTime?: string | null;
  neverExpires?: boolean;
  discountType?: "percentage" | "fixed";
  discountPercentage: number;
  discountAmount?: number;
  minimumAmount: number;
  maxUses?: number | null;
  usedCount?: number;
  productType: string;
  applicableCategories?: Array<string | { _id: string; parent?: string }>;
  startTime: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}


export interface IAddCoupon {
  title: string;
  logo?: string;
  couponCode: string;
  endTime?: string | null;
  neverExpires?: boolean;
  discountType?: "percentage" | "fixed";
  discountPercentage: number;
  discountAmount?: number;
  discountValue?: number;
  minimumAmount: number;
  maxUses?: number | null;
  productType?: string;
  applicableCategories?: string[];
  startTime?: string;
  status?: string;
}
