import React, { useState } from "react";

const faqs = [
  {
    question: "Can I order fresh vegetables at midnight?",
    answer:
      "Absolutely! Our veggies don't sleep — and neither do we. Place your order anytime; we deliver freshness around the clock.",
  },
  {
    question: "What if I receive a damaged item?",
    answer:
      "Oops! We’re really sorry. Return and Refund is not available yet. We are working on it.",
  },
  {
    question: "Is delivery really free?",
    answer:
      "Yup — 100% free delivery. No hidden charges. Just fresh groceries, fast.",
  },
  {
    question: "How do I pay?",
    answer:
      "Choose between Cash on Delivery, UPI, Net Banking, or Card. We’ve got all your payment preferences covered.",
  },
  {
    question: "What if I’m not home when the delivery arrives?",
    answer:
      "No worries! Our delivery partner will give you a call. If you're unavailable, we’ll reschedule your delivery or drop it at your building's security (with your permission). Freshness still guaranteed!",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-3xl mx-auto mt-28 mb-24 px-4">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl shadow-sm overflow-hidden transition"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition"
            >
              <span className="text-lg font-medium text-gray-800">
                {item.question}
              </span>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openIndex === index && (
              <div className="px-6 py-3 text-gray-600 bg-gradient-to-br from-green-50 to-white transition-all duration-300">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
