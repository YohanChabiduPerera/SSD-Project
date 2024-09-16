import React, { memo } from "react";
import { PageHeader } from "../../components/Banner";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { ItemMapper } from "../../components/ItemMappers";

// Memoize the Header
const MemoizedHeader = memo(Header);

// Memoize the PageHeader
const MemoizedPageHeader = memo(PageHeader);

// Memoize the Footer
const MemoizedFooter = memo(Footer);

// Memoize the ItemMapper
const MemoizedItemMapper = memo(ItemMapper);

// Now use the memoized components in your Product component
export default function Product({
  UseUserContext,
  UseItemContext,
  useCartContext,
}) {
  return (
    <div>
      <MemoizedHeader UseUserContext={UseUserContext} />
      <MemoizedPageHeader />
      <div style={{ marginLeft: 90 }}>
        <h2>Featured Products</h2>
        <p>Discover a wide range of herbal products</p>
      </div>
      <MemoizedItemMapper
        UseItemContext={UseItemContext}
        UseUserContext={UseUserContext}
        useCartContext={useCartContext}
      />
      <MemoizedFooter />
    </div>
  );
}
