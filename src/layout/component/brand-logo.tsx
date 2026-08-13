"use client";
import Image from "next/image";
import Link from "next/link";

type IProps = {
  href?: string;
  className?: string;
};

export default function BrandLogo({ href = "/dashboard", className = "" }: IProps) {
  const logo = (
    <Image
      className={`h-9 w-auto max-w-[150px] object-contain object-left ${className}`}
      width={160}
      height={48}
      src="/assets/img/logo/logo.png"
      alt="Cotniva"
      priority
    />
  );

  if (!href) return logo;
  return <Link href={href}>{logo}</Link>;
}
