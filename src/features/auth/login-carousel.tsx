import { useEffect, useState } from "react";

const adminPortalContent = [
  {
    title: "Fast, Intuitive Point of Sale (POS)",
    description:
      "Process orders quickly, handle payments, and manage customer interactions right at the counter.",
  },
  {
    title: "Real-Time Stock and Inventory Tracking",
    description:
      "Monitor current stock levels across all warehouses and track every movement with accuracy.",
  },
  {
    title: "Supplier & Purchase Order Management",
    description:
      "Efficiently create purchase orders, track incoming shipments, and manage supplier relationships.",
  },
  {
    title: "Comprehensive Sales & Financial Reporting",
    description:
      "Gain deep insights into product performance, payment trends, and staff sales metrics.",
  },
  {
    title: "Centralized Product Catalog & Pricing",
    description:
      "Maintain a single, organized catalog for products, brands, categories, and price history.",
  },
];

export default function LoginCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-cycle effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(
        (prevIndex) => (prevIndex + 1) % adminPortalContent.length
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Function to manually set the index via dots (optional)
  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const activeFeature = adminPortalContent[activeIndex];

  return (
    <div className="relative hidden w-3/5 lg:block">
      {/* The Image (Background, Gradient, and Overlay) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          // 💡 Ensure this image is relevant to inventory/retail (e.g., a modern warehouse or POS terminal)
          backgroundImage: "url('/assets/image.png')",
          backgroundColor: "rgba(0, 0, 0, 0.05)",
          backgroundBlendMode: "multiply",
        }}
      >
        {/* Gradient for Text Contrast */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      {/* Content Layer (Logo, Carousel, and Dots) */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8 text-white">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          {/* Logo SVG - No change to shape, only contextual color if needed */}
          <img src="/assets/logo.png" className="h-16 rounded-3xl" />
        </div>

        {/* Carousel Content */}
        <div className="pb-2">
          {/* Active Feature Display with Transition */}
          <div className="h-20 transition-all duration-700 ease-in-out">
            <h3 className="text-3xl font-semibold opacity-100 transition-opacity duration-700">
              {activeFeature.title}
            </h3>
            <p className="text-lg font-medium text-gray-300 opacity-100 transition-opacity duration-700">
              {activeFeature.description}
            </p>
          </div>

          {/* Carousel Dots - now interactive */}
          <div className="mt-8 flex space-x-2">
            {adminPortalContent.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
