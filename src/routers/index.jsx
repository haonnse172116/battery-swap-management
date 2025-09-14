import { createBrowserRouter } from "react-router-dom";
import Placeholder from "@/pages/PlaceHolder";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home/>,
  },
  {
    path: "/admin",
    element: <Placeholder title="Admin Page" />,
  },
  {
    path: "/driver",
    element: <Placeholder title="Driver Page" />,
  },
  {
    path: "/staff",
    element: <Placeholder title="Staff Page" />,
  },
  {
    path: "/login",
    element: <Placeholder title="Login Page" />,
  },
]);
