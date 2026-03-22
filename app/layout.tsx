import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "티셔츠 상세페이지 자동생성 편집기",
  description: "미디어와 텍스트를 조합해 모바일 상세페이지 초안을 만드는 MVP"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
