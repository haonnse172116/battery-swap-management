import { Outlet } from "react-router-dom";
import Navbar from "./navbar/Navbar";

const AuthorizedLayout = ({ children, type }) => {
  return (
    <div className="min-h-screen w-screen bg-gray-50">
      <Navbar type={type} />
      <main className="pt-16 w-full mx-auto">
          {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default AuthorizedLayout;