import React, { useEffect, useState } from "react";
import "./CounterSection.css";

const CounterSection = () => {
  const stats = [
    { number: "10,000+", label: "Active Students", icon: "👨‍🎓" },
    { number: "100+", label: "Courses", icon: "📚" },
    { number: "95%", label: "Success Rate", icon: "🎯" },
    { number: "24/7", label: "Support", icon: "💬" },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#141d2b] via-[#0b121f] to-[#141d2b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-400 text-sm font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default CounterSection;
