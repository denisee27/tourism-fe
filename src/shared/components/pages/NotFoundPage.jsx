import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import SplitText from "gsap/SplitText";
//* This showcase that you can add simple animation, and i prefer gsap for this
gsap.registerPlugin(useGSAP, SplitText);

const NotFoundPage = () => {
  const container = useRef(null);
  const navigate = useNavigate();

  useGSAP(
    () => {
      const split = SplitText.create(".animate-me", {
        type: "words",
        aria: "hidden",
      });

      gsap.from(split.words, {
        y: 24,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "sine.out",
      });

      const tl = gsap.timeline({ repeat: -1, defaults: { ease: "power2.out" } });

      tl.from(".nf-main", { y: 24, opacity: 0, duration: 0.9 }, "-=0.6")
        .from(".nf-title", { y: 24, opacity: 0, duration: 0.9 }, "-=0.55")
        .from(".nf-subtitle", { y: 16, opacity: 0, duration: 0.8 }, "-=0.45")
        .to(".nf-glow", { boxShadow: "0 0 40px rgba(79, 70, 229, 0.3)", duration: 1.2 }, 0)
        .to([".nf-main", ".nf-title", ".nf-subtitle"], { opacity: 0.45, duration: 0.8 }, "+=2")
        .to([".nf-main", ".nf-title", ".nf-subtitle"], { opacity: 1, duration: 0.6 })
        .set(split.words, { opacity: 0 });

      return () => {
        tl.kill();
        split.revert();
      };
    },
    { scope: container }
  );
  return (
    <div ref={container} className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mb-8 flex justify-center">
          <div className="nf-glow flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100">
            <svg
              className="h-12 w-12 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="nf-main text-sm uppercase tracking-widest text-indigo-500">404 error</h1>
        <h2 className="nf-title mt-4 text-4xl font-bold text-gray-900">Page not found</h2>
        <p className="nf-subtitle mt-4 text-base text-gray-600">
          Sorry, we couldn't find the page you're looking for. It may have been removed or the url
          may be mistyped.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            ← Go back
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Back to dashboard
          </button>
        </div>

        <p className="animate-me mt-8 text-xs text-gray-400">
          Need help? Contact support or return to the home page.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
