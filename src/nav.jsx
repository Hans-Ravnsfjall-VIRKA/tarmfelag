import React, { createContext, useContext, useState } from "react";
const NavCtx = createContext(null);
function NavProvider({ children }) {
  const [stack, setStack] = useState([]);
  const value = {
    stack,
    push: (entry) => setStack((s) => [...s, entry]),
    pop: () => setStack((s) => s.slice(0, -1)),
    reset: () => setStack([])
  };
  return <NavCtx.Provider value={value}>{children}</NavCtx.Provider>;
}
function useNav() {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error("useNav must be used inside NavProvider");
  return ctx;
}
export {
  NavProvider,
  useNav
};
