import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";


import { Fade,  } from "react-awesome-reveal"; // Add more animations if needed
import App from "../content-folders/Home/HeroHomeSection";

export const Home = () => {
  return (
    <div>
      <Navbar />

      {/* Hero Section - Fade In from Bottom */}
      <Fade triggerOnce cascade damping={0.1}>
        <App />
      </Fade>


      {/* Footer - Simple Fade In */}
      <Fade triggerOnce delay={200}>
        <Footer />
      </Fade>
    </div>
  );
};
