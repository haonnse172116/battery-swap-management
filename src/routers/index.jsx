import { createBrowserRouter } from "react-router-dom";
import ContentError from "../components/common/ContentError";
import Placeholder from "../pages/PlaceHolder";
import Landing from "../pages/Landing";
import Dashboard from "../pages/admin/dashboard";
import DefaultLayout from "../components/layouts/DefaultLayout";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import { PATHS } from "../constant/path/pathname";
import AuthorizedLayout from "../components/layouts/AuthorizedLayout";
import DriverHome from "../pages/driver/home";
import MyCar from "../pages/driver/mycar";
// import StaffDashboard from "../pages/staff/dashboard";
// import StaffSwapConfirm from "../pages/staff/swapConfirm";
import StaffTransactionHistory from "../pages/staff/transactionHistory";
import StaffTransactionConfirm from "../pages/staff/transactionConfirm";
// import BatteryInventory  from "../pages/staff/batteryInventory";
import BatteryStatus from "../pages/staff/batteryStatus";
import Booking from "../pages/driver/booking";

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
      { path: PATHS.DRIVER.MYCAR, element: <MyCar /> },
      { path: PATHS.DRIVER.BOOKING, element: <Booking /> }
    ]
  },
  {
    path: PATHS.STAFF.ROOT,
    element:  <AuthorizedLayout type='staff' />,
    children:  [
      {path: PATHS.STAFF.DASHBOARD, element: <Placeholder title='Staff Dashboard'/>},
      {path: PATHS.STAFF.SWAP.CONFIRM, element: <Placeholder title='Staff Swap Confirm'/>},
      {path: PATHS.STAFF.SWAP.PAYMENT, element: <StaffTransactionConfirm title='Staff Confirm Transaction'/>},
      {path: PATHS.STAFF.SWAP.HISTORY, element: <StaffTransactionHistory title='Staff Transaction History'/>},
      {path: PATHS.STAFF.INVENTORY.LIST, element: <Placeholder title='Staff battery store'/>},
      {path: PATHS.STAFF.INVENTORY.STATUS, element: <BatteryStatus title='Staff battery status'/>},
    ]
  },
  {
    path: "*",
    element: <ContentError type="404" />,
  }
]);
