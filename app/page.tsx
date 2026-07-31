import Hero from "@/components/Hero";
import PopularCourses from "@/components/PopularCourses";
import FeaturesOffer from "@/components/FeaturesOffer";
import HowItWorks from "@/components/HowItWorks";
import Testimonial from "@/components/Testimonial";
import TopBar from "@/components/TopBar";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import TestCase from "@/components/TestCase";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F2F0E4]">
      <TopBar />
      <Hero />
      <PopularCourses />
      <FeaturesOffer />
      <HowItWorks />
      {/* <TestCase /> */}
      {/* <Testimonial /> */}
      {/* <Contact /> */}
      {/* <Faq /> */}
      <Footer />
    </main>
  );
}
