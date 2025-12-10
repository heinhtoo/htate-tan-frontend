import React from "react";
import WrapperClient from "./WrapperClient";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <WrapperClient>{children}</WrapperClient>;
}

export default Wrapper;
