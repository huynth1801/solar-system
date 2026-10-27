import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const vietnamSans = Be_Vietnam_Pro({
  variable: "--font-vietnam-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Hệ Mặt Trời 3D — Mô hình tương tác",
  description:
    "Khám phá Hệ Mặt Trời qua mô hình 3D tương tác: texture NASA thật, quỹ đạo chuyển động theo tỷ lệ thực, click vào từng hành tinh để xem thông tin chi tiết tiếng Việt.",
};

export const viewport: Viewport = {
  themeColor: "#020010",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${vietnamSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
