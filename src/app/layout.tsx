import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Nav } from "@/components/nav";
import { Toaster } from "sonner";
import { ChatBot } from "@/components/chat-bot";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "worklog",
  description: "AI-powered work activity logger",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark selection:bg-indigo-500/30">
      <body
        suppressHydrationWarning
        className={`${outfit.className} bg-[#0A0A0A] text-zinc-100 min-h-screen relative overflow-x-hidden`}
      >
        {/* Ambient background glows */}
        <div className="pointer-events-none fixed inset-0 flex justify-center">
          <div className="absolute top-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[120px]" />
          <div className="absolute right-[-20%] top-[20%] h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[130px]" />
        </div>
        
        <div className="relative z-10 flex min-h-screen flex-col">
          <Nav />
          <div className="flex-1 w-full pt-20 pb-20">
            {children}
          </div>
        </div>
        <ChatBot />
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid #27272a",
              color: "#e4e4e7",
            },
          }}
        />
      </body>
    </html>
  );
}