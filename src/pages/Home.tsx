import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";


import { Fade,  } from "react-awesome-reveal"; // Add more animations if needed
import HeroHomeSection from "../content-folders/Home/HeroHomeSection";
import Seo, { PAGES } from "../components/Seo";
export const Home = () => {
  return (
    <div>
       <Seo {...PAGES.home} />
      <Navbar />

      {/* Hero Section - Fade In from Bottom */}
      <Fade triggerOnce cascade damping={0.1}>
       <HeroHomeSection />
      </Fade>



      {/* Footer - Simple Fade In */}
      <Fade triggerOnce delay={200}>
        <Footer />
      </Fade>
    </div>
  );
};
