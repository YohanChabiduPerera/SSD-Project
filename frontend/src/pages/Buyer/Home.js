import React, { memo } from "react";
import Features from "../../components/Features";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { ItemMapperHome } from "../../components/ItemMapperHome";
import { ActionBanner } from "../../components/Banner";
import { Slider } from "../../components/Slider";
import { UseItemContext } from "../../context/useItemContext";
import { UseUserContext } from "../../context/useUserContext";
import { useCartContext } from "../../context/useCartContext";

// Memoize Components
const MemoizedHeader = memo(Header);
const MemoizedFeatures = memo(Features);
const MemoizedFooter = memo(Footer);
const MemoizedActionBanner = memo(ActionBanner);
const MemoizedSlider = memo(Slider);
const MemoizedItemMapperHome = memo(ItemMapperHome);

export default function Home() {
  return (
    <div>
      {/* Using Memoized Components */}
      <MemoizedHeader UseUserContext={UseUserContext} />
      <MemoizedSlider />
      <MemoizedFeatures />
      <MemoizedActionBanner UseUserContext={UseUserContext} />
      <div style={{ marginLeft: 90 }}>
        <h2>Featured Products</h2>
        <p>Discover a wide range of herbal products</p>
      </div>
      <MemoizedItemMapperHome
        UseItemContext={UseItemContext}
        UseUserContext={UseUserContext}
        useCartContext={useCartContext}
      />
      <MemoizedFooter />
    </div>
  );
}
