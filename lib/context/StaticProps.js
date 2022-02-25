import React from "react";

const StaticPropsContext = React.createContext({});

const StaticPropsProvider = ({ value, children }) => {
  return (
    <StaticPropsContext.Provider value={value}>
      {children}
    </StaticPropsContext.Provider>
  );
};

export { StaticPropsContext, StaticPropsProvider };
