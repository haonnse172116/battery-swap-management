import { createBrowserRouter } from "react-router-dom";
import ContentError from "../components/common/ContentError";
import Landing from "../pages/Landing";
import Dashboard from "../pages/admin/dashboard";
import DefaultLayout from "../components/layouts/DefaultLayout";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import { PATHS } from "../constant/path/pathname";
import AuthorizedLayout from "../components/layouts/AuthorizedLayout";
import DriverHome from "../pages/driver/home";
import MyCar from "../pages/driver/mycar";

export const router = createBrowserRouter([
  {
    path: PATHS.PUBLIC.LANDING,
    element: 
    <DefaultLayout>
      <Landing />
    </DefaultLayout>,
  },
   {
    path: PATHS.AUTH.LOGIN,
    element: 
    <DefaultLayout>
     <Login />
    </DefaultLayout>,
  },
  {
    path: PATHS.AUTH.REGISTER,
    element: 
    <DefaultLayout>
     <Register />
    </DefaultLayout>,
  },
  {
    path: PATHS.ADMIN.ROOT,
    element: <AuthorizedLayout type='admin' />,
    children: [
      { path: PATHS.ADMIN.DASHBOARD, element: <Dashboard /> },
    ]
  }
  ,
  {
    path: PATHS.DRIVER.ROOT,
    element: <AuthorizedLayout type='driver' />,
    children: [
      { path: PATHS.DRIVER.HOME, element: <DriverHome /> },
      { path: PATHS.DRIVER.MYCAR, element: <MyCar /> }
    ]
  },
  {
    path: PATHS.STAFF.ROOT,
    element:  <AuthorizedLayout type='staff' />,
  },
  {
    path: "*",
    element: <ContentError type="404" />,
  }
]);
