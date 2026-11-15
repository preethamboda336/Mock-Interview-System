import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { InterviewProvider } from "@/context/InterviewContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Career Coach | Technical Mock Interviews Powered by Azure",
  description:
    "Master technical interviews with personalized question generation and deep AI feedback powered by Azure Functions and GPT-4.1-mini.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#070d19] text-slate-100 selection:bg-sky-500/20 selection:text-sky-200">
        <ThemeProvider>
          <InterviewProvider>
            <SidebarProvider>
              <AppLayout>{children}</AppLayout>
            </SidebarProvider>
          </InterviewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
