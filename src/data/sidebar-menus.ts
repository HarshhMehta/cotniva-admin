import { ISidebarMenus } from "./../types/menu-types";
import {
  Dashboard,
  Categories,
  Coupons,
  Customers,
  Orders,
  Pages,
  Products,
  Profile,
  Reviews,
  Setting,
  StuffUser,
} from "@/svg";

const sidebar_menu: Array<ISidebarMenus> = [
  {
    id: 1,
    icon: Dashboard,
    link: "/dashboard",
    title: "Dashboard",
  },
  {
    id: 2,
    icon: Products,
    link: "/product-list",
    title: "Products",
    subMenus: [
      { title: "Product List", link: "/product-list" },
      { title: "Product Grid", link: "/product-grid" },
      { title: "Add Product", link: "/add-product" },
    ],
  },
  {
    id: 3,
    icon: Categories,
    link: "/category",
    title: "Category",
  },
  {
    id: 16,
    icon: Pages,
    link: "/size-guide",
    title: "Size Guides",
  },
  {
    id: 4,
    icon: Orders,
    link: "/orders",
    title: "Orders",
  },
  {
    id: 17,
    icon: Customers,
    link: "/customers",
    title: "Customers",
  },
  {
    id: 18,
    icon: Reviews,
    link: "/checkout-feedback",
    title: "Checkout Feedback",
  },
  {
    id: 6,
    icon: Reviews,
    link: "/reviews",
    title: "Reviews",
  },
  {
    id: 7,
    icon: Coupons,
    link: "/coupon",
    title: "Coupons",
  },
  {
    id: 8,
    icon: Profile,
    link: "/profile",
    title: "Profile",
  },
  {
    id: 9,
    icon: Setting,
    link: "#",
    title: "Online store",
  },
  {
    id: 10,
    icon: StuffUser,
    link: "/our-staff",
    title: "Our Staff",
  },
  {
    id: 11,
    icon: Pages,
    link: "/dashboard",
    title: "Pages",
    subMenus: [
      { title: "Register", link: "/register" },
      { title: "Login", link: "/login" },
      { title: "Forgot Password", link: "/forgot-password" },
    ],
  },
  {
    id: 12,
    icon: Pages,
    link: "/slider",
    title: "Slider",
  },
  {
    id: 14,
    icon: Pages,
    link: "/gallery",
    title: "Our Gallery",
  },
  {
    id: 13,
    icon: Setting,
    link: "/topbar",
    title: "Top Bar",
  },
  {
    id: 15,
    icon: Setting,
    link: "/whatsapp",
    title: "WhatsApp OTP",
  },
];

export default sidebar_menu;
