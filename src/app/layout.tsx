import type { Metadata } from "next";
import { Noto_Sans_TC, Ma_Shan_Zheng } from "next/font/google";
import "./globals.css";

const noto = Noto_Sans_TC({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });
const calligraphy = Ma_Shan_Zheng({ subsets: ["latin"], weight: ["400"], variable: "--font-calligraphy" });

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
    <html lang="zh-TW" className={`${calligraphy.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Noto+Serif+TC:wght@400;700&family=Zhi+Mang+Xing&family=ZCOOL+XiaoWei&display=swap" rel="stylesheet" />
      </head>
      <body className={noto.className}>
        {children}
      </body>
    </html>
  );
}
