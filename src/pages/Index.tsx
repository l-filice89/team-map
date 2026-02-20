import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";

const Index = () => {
  // Temporary auth state - will be replaced with real authentication
  const [isAuthenticated] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Header isAuthenticated={isAuthenticated} />
      
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
