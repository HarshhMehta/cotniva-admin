
type Brand = {
  name: string;
  id: string;
}

type Category = {
  name: string;
  id: string;
}

type Color = {
  name: string;
  clrCode: string;
}

type ImageURL = {
  color?: Color;
  img: string;
}

export interface AdditionalInfo {
  key: string;
  value: string;
}
type IReviewUser = {
  _id:string;
  name:string;
  email:string;
}
type TReview = {
  _id: string;
  userId: IReviewUser;
  productId: string;
  rating: number;
  comment: string;
  updatedAt: string;
  createdAt: string;
}


export interface IProduct {
  _id: string;
  brand: Brand;
  category: Category;
  sku: string;
  img: string;
  title: string;
  slug?: string;
  unit?: string;
  imageURLs: ImageURL[];
  parent: string;
  children: string;
  price: number;
  discount?: number;
  quantity: number;
  status: 'in-stock' | 'out-of-stock' | 'discontinued';
  reviews?: TReview[];
  productType: string;
  description: string;
  additionalInformation?: AdditionalInfo[];
  offerDate?: {
    startDate: string,
    endDate: string,
  }
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sellCount?: number;
  sizes?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  orderQuantity: number;
}

export interface ProductResponse {
  success: boolean;
  data: IProduct[];
}

// IAddProduct
export interface IAddProduct {
  sku: string;
  img: string;
  title: string;
  slug?: string;
  unit: string;
  imageURLs: {
    color: {
      name?: string;
      clrCode?: string;
    };
    img: string;
    sizes?: string[];
  }[];
  parent: string;
  children: string;
  price: number;
  discount: number;
  quantity: number;
  brand: { name: string, id: string };
  category: { name: string, id: string };
  status: 'in-stock' | 'out-of-stock' | 'discontinued';
  productType: string;
  description: string;
  videoId?: string;
  additionalInformation?: {
    key: string;
    value: string;
  }[];
  tags?: string[];
  sizes?: string[];
  offerDate?: {
    startDate: string | null,
    endDate: string | null
  },
}

// review product response 
export interface IReviewProductRes {
  success:boolean;
  data:IProduct[]
}
// delete review product response 
export interface IDelReviewsRes {
  success:boolean;
  message:string;
}

export interface Variant {
  img: File | string;
  color: string;
  size: string;
  isDefault: boolean;
}

export interface ProductFormData {
  title: string;
  sku: string;
  unit: string;
  price: number;
  discount_percentage?: number;
  quantity: number;
  parent: string;
  children: string;
  brand: {
    name: string;
    id: string;
  };
  category: {
    name: string;
    id: string;
  };
  status: "in-stock" | "out-of-stock" | "discontinued";
  productType: string;
  description: string;
  youtube_video_Id?: string;
  tags: string;
  sizes: string;
  offerStartDate?: string | Date;
  offerEndDate?: string | Date;
  featured: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
}