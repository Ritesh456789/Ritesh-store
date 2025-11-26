
import HeroSection from "./components/HeroSection";
import Services from "./components/Services";
import Trusted from "./components/Trusted";
import FeatureProduct from "./components/FeatureProduct";


const Home = () => {
  const data = {
    name: "Rainbow Store ",
  };

  return (
    <>
  <HeroSection myData={data} />
  <FeatureProduct/>
  <Services/>
  <Trusted/>
  
  </>
  );
};  

export default Home;
