
export interface ICoupon {
  _id: string;
  title: string;
  logo: string;
  couponCode: string;
  endTime?: string | null;
  neverExpires?: boolean;
  discountPercentage: number;
  minimumAmount: number;
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
  discountPercentage: number;
  minimumAmount: number;
  productType?: string;
  applicableCategories?: string[];
  startTime?: string;
  status?: string;
}
