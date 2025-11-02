import React from "react";

const DefaultLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-screen">
      <main>{children}</main>
    </div>
  );
};

export default DefaultLayout;
