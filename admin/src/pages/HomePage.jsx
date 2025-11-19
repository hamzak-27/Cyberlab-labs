import BenefitsSection from "@/components/BenefitsSection/BenefitsSection";
import CaseStudiesSection from "@/components/CaseStudiesSection/CaseStudiesSection";
import CounterSection from "@/components/CounterSection/CounterSection";
import Hero from "@/components/Hero";
import Home_page from "@/components/Home_page";
import ReviewSection from "@/components/ReviewSection/ReviewSection";
import VideoSection from "@/components/VideoSection/VideoSection";
import React from "react";

function HomePage() {
  return (
    <div className="bg-[#e6d9cc]">
      <Hero />
      <Home_page />
      <BenefitsSection />
      {/* <VideoSection /> */}
      <CounterSection />
      <CaseStudiesSection />
      <ReviewSection />
    </div>
  );
}

export default HomePage;
