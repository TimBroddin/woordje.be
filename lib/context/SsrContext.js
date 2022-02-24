import React from "react";

const SsrContext = React.createContext({});

const SsrContextProvider = ({ value, children }) => {
  return <SsrContext.Provider value={value}>{children}</SsrContext.Provider>;
};

export { SsrContext, SsrContextProvider };
