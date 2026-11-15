import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ArtistLineup from "@/components/ArtistLineup";
import EventDetails from "@/components/EventDetails";
import SponsorSection from "@/components/SponsorSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <ArtistLineup />
        <EventDetails />
        <SponsorSection />
      </main>
      <Footer />
    </>
  );
}
