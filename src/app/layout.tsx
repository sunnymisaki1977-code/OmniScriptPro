import type { Metadata } from "next";
import "./globals.css";
import SupportWidget from "@/components/SupportWidget";

export const metadata: Metadata = {
  title: "OmniScript｜讓你的影響力，無所不在。あなたの影響力を、あらゆる場所へ。",
  description: "讓你的影響力，無所不在。あなたの影響力を、あらゆる場所へ。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@300;400;500;700&family=Zhi+Mang+Xing&family=ZCOOL+XiaoWei&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <SupportWidget />
      </body>
    </html>
  );
}
