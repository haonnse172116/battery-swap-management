import { createBrowserRouter } from "react-router-dom";
import Placeholder from "@/pages/PlaceHolder";
import ContentError from "../components/common/ContentError";
import Landing from "../pages/Landing";
import AdminLayout from "../components/layouts/AdminLayout";
import Dashboard from "../pages/admin/dashboard";
import DefaultLayout from "../components/layouts/DefaultLayout";
import StaffLayout from "../components/layouts/StaffLayout";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";

export const router = createBrowserRouter([
  {
    path: "/",
    element: 
    <DefaultLayout>
      <Landing />
    </DefaultLayout>,
  },
   {
    path: '/login',
    element: 
    <DefaultLayout>
     <Login />
    </DefaultLayout>,
  },
  {
    path: "/register",
    element: 
    <DefaultLayout>
     <Register />
    </DefaultLayout>,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "dashboard", element: <Dashboard /> },
    ]
  }
  ,
  {
    path: "/driver",
    element: <Placeholder title="Driver Page" />,
  },
  {
    path: "/staff",
    element:  <StaffLayout />,
  },
  {
    path: "*",
    element: <ContentError type="404" />,
  }
]);
