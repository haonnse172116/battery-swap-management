import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import Navbar from "./navbar/Navbar";
import { SidebarProvider, useSidebar } from "../../contexts/SidebarContext";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);

    if (media.addEventListener) {
      media.addEventListener("change", listener);
    } else {
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}


const AuthorizedLayoutContent = ({ children, type }) => {
  const { collapsed } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 relative">
      {isMobile ? (
        <>
          <Navbar type={type} />
          <main className="mt-16 flex-1 overflow-auto">
            {children ?? <Outlet />}
          </main>
        </>
      ) : (    
        <div className="flex min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-500 overflow-hidden px-4">
          <Sidebar type={type} />
          <main
            style={{
              marginLeft: collapsed ? "80px" : "256px",
              transition: "margin-left 0.3s ease-in-out",
            }}
            className="flex-1 h-screen overflow-auto"
          >
            {children ?? <Outlet />}
          </main>
        </div>
      )}
    </div>
  );
};

const AuthorizedLayout = ({ children, type }) => (
  <SidebarProvider>
    <AuthorizedLayoutContent type={type}>{children}</AuthorizedLayoutContent>
  </SidebarProvider>
);

export default AuthorizedLayout;
