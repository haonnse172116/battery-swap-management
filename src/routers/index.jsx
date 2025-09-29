import { createBrowserRouter } from "react-router-dom";
import Placeholder from "@/pages/PlaceHolder";
import ContentError from "../components/common/ContentError";
import DefaultLayout from "../components/layouts/DefaultLayout";
import Landing from "../pages/Landing";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout>
        <Landing />
      </DefaultLayout>,
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
  { 
    path: "*",
    element: <ContentError type="404" />,
  }
]);
