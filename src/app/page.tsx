// src/app/page.tsx
import Header from "@/components/Header";
import Landing from "@/components/landing/page";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col antialiased selection:bg-emerald-950/10">
      <Header />
      <main className="flex-1 flex flex-col">
        <Landing />
      </main>
      <Footer />
    </div>
  );
}