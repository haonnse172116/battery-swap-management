import { Outlet } from "react-router-dom";
import Navbar from "./navbar/Navbar";

const AuthorizedLayout = ({ children, type }) => {
  return (
    <div className="min-h-screen w-screen bg-gray-50">
      <Navbar type={type} />
      <main className="pt-20 px-4 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AuthorizedLayout;