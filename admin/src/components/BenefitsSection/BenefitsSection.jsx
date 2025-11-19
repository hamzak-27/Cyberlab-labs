import React from "react";
import "./BenefitsSection.css";

const BenefitsSection = () => {
  const benefits = [
    {
      icon: "📚",
      title: "Structured Learning Path",
      description:
        "Follow curated courses from basics to advanced techniques with clear progression",
    },
    {
      icon: "💻",
      title: "Hands-On Practice",
      description:
        "Apply knowledge in simulated environments and real-world scenarios",
    },
    {
      icon: "🔄",
      title: "Updated Weekly",
      description:
        "Content constantly refreshed to reflect current threats and best practices",
    },
    {
      icon: "♾️",
      title: "Lifetime Access",
      description:
        "Learn at your own pace with permanent access to all course materials",
    },
  ];

  return (
    <section className="py-20 bg-[#0b121f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Macksofy Tech
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Learn cybersecurity the right way with comprehensive, practical
            training
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-6 hover:border-blue-500/50 transition-all hover:transform hover:scale-105"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all"></div>

              <div className="relative">
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default BenefitsSection;
