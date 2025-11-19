import React from "react";
import "./ReviewSection.css";

const ReviewSection = () => {
  const reviews = [
    {
      name: "Sarah Johnson",
      role: "Security Analyst at TechCorp",
      image: "SJ",
      rating: 5,
      text: "After years in IT, I wanted to transition to cybersecurity. Macksofy Tech's structured approach gave me the confidence to land my first SOC analyst role!",
    },
    {
      name: "Michael Chen",
      role: "Penetration Tester at SecureNet",
      image: "MC",
      rating: 5,
      text: "As a complete beginner, I was intimidated by cybersecurity. The courses start from absolute basics. Now I'm working as a junior penetration tester!",
    },
    {
      name: "David Rodriguez",
      role: "CISO at FinanceSecure Inc.",
      image: "DR",
      rating: 5,
      text: "We trained our entire security team with Macksofy Tech. The enterprise plan gave us flexibility, and our team's skills improved dramatically!",
    },
  ];

  return (
    <section id="reviews" className="py-20 bg-[#0b121f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Real Students,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Real Results
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            See what our students have achieved
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-[#141d2b] to-[#0b121f] rounded-2xl border border-gray-800/50 p-6 hover:border-blue-500/50 transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-yellow-400"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-300 leading-relaxed mb-6">
                {review.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {review.image}
                </div>
                <div>
                  <div className="text-white font-semibold">{review.name}</div>
                  <div className="text-gray-500 text-sm">{review.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
