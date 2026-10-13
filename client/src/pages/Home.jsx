import React from "react";
import MainBanner from "../components/MainBanner";
import Categories from "../components/Categories";
import BestSellers from "../components/BestSellers";
import BottomBanner from "../components/BottomBanner";
import Subscribe from "../components/Subscribe";

const Home = () => {
  return (
    <div className="mt-6 sm:mt-12 pt-20">
      <MainBanner />
      <Categories />
      <BestSellers />
      <BottomBanner />
      <Subscribe />
    </div>
  );
};

export default Home;
