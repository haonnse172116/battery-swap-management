import { createBrowserRouter } from "react-router-dom";
import ContentError from "../components/common/ContentError";
import Placeholder from "../pages/PlaceHolder";
import Landing from "../pages/Landing";
import DefaultLayout from "../components/layouts/DefaultLayout";
import Login from "../pages/auth/login";
import Register from "../pages/auth/register";
import { PATHS } from "../constant/path/pathname";
import AuthorizedLayout from "../components/layouts/AuthorizedLayout";
import Dashboard from "../pages/admin/dashboard";
import StationAdd from "../pages/admin/stationAdd";
import StationList from "../pages/admin/stationList";
import StationBattery from "../pages/admin/stationBattery";
import StationComplaint from "../pages/admin/stationComplaint";
import UserList from "../pages/admin/userList";
import UserStationStaff from "../pages/admin/userStationStaff";
import BatteryAdd from "../pages/admin/batteryAdd";
import AdminBatteryList from "../pages/admin/batteryList";
import SubscriptionCreate from "../pages/admin/subscriptionCreate";
import SubscriptionList from "../pages/admin/subscriptionList";

import DriverHome from "../pages/driver/home";
import MyCar from "../pages/driver/mycar";

import SwapConfirm from "../pages/staff/swapConfirm";
import TransactionHistory from "../pages/staff/transactionHistory";
import TransactionConfirm from "../pages/staff/transactionConfirm";
import BatteryList from "../pages/staff/batteryList";
import BatteryStatus from "../pages/staff/batteryStatus";
import BatterySlot from "../pages/staff/batterySlot";
import Booking from "../pages/driver/booking";
import VerifyOtp from "../pages/auth/otp";
import BookingsPage from "../pages/driver/bookings";
import SwapsPage from "../pages/driver/myswaps";
import SubscriptionPage from "../pages/driver/subcription";
import PaymentResult from "../pages/driver/subcription/PaymentResult";
import Profile from "../pages/auth/profile";
import PaymentsPage from "../pages/driver/payments";
import AboutUs from "../pages/AboutUs";

export const router = createBrowserRouter([
  {
    path: PATHS.PUBLIC.LANDING,
    element:
      <DefaultLayout>
        <Landing />
      </DefaultLayout>,
  },
  {
    path: PATHS.PUBLIC.ABOUT,
    element:
      <DefaultLayout>
        <AboutUs />
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
    path: PATHS.AUTH.VERIFY_OTP,
    element:
      <DefaultLayout>
        <VerifyOtp />
      </DefaultLayout>,
  },
  {
    path: PATHS.ADMIN.ROOT,
    element: <AuthorizedLayout type='admin' />,
    children: [
      { path: PATHS.ADMIN.DASHBOARD, element: <Dashboard /> },
      { path: PATHS.ADMIN.STATIONS.LIST, element: <StationList /> },
      { path: PATHS.ADMIN.STATIONS.COMPLAINTS, element: <StationComplaint /> },
      { path: PATHS.ADMIN.STATIONS.ADD, element: <StationAdd /> },
      { path: PATHS.ADMIN.USERS.LIST, element: <UserList /> },
      { path: PATHS.ADMIN.USERS.STATION_STAFF, element: <UserStationStaff /> },
      { path: PATHS.ADMIN.USERS.CREATE, element: <Placeholder title='Admin create user' /> },
      { path: PATHS.ADMIN.BATTERY.LIST, element: <AdminBatteryList /> },
      { path: PATHS.ADMIN.BATTERY.STATION_BATTERY, element: <StationBattery /> },
      { path: PATHS.ADMIN.BATTERY.ADD, element: <BatteryAdd /> },
      { path: PATHS.ADMIN.SUBSCRIPTIONS.LIST, element: <SubscriptionList /> },
      { path: PATHS.ADMIN.SUBSCRIPTIONS.CREATE, element: <SubscriptionCreate /> },
      { path: PATHS.ADMIN.PROFILE, element: <Profile /> },
    ]
  }
  ,
  {
    path: PATHS.DRIVER.ROOT,
    element: <AuthorizedLayout type='driver' />,
    children: [
      { path: PATHS.DRIVER.HOME, element: <DriverHome /> },
      { path: PATHS.DRIVER.MYCAR, element: <MyCar /> },
      { path: PATHS.DRIVER.BOOKING, element: <Booking /> },
      { path: PATHS.DRIVER.BOOKINGPAGE, element: <BookingsPage /> },
      { path: PATHS.DRIVER.MYSWAPS, element: <SwapsPage /> },
      { path: PATHS.DRIVER.SUBSCRIPTION, element: <SubscriptionPage /> },
      { path: PATHS.DRIVER.SUBSCRIPTION_PAYMENT, element: <PaymentResult /> },
      { path: PATHS.DRIVER.PAYMENTS, element: <PaymentsPage /> },
      { path: PATHS.DRIVER.PROFILE, element: <Profile /> },
    ]
  },
  {
    path: PATHS.STAFF.ROOT,
    element: <AuthorizedLayout type='staff' />,
    children: [
      { path: PATHS.STAFF.DASHBOARD, element: <Placeholder title='Staff Dashboard' /> },
      { path: PATHS.STAFF.SWAP.CONFIRM, element: <SwapConfirm /> },
      { path: PATHS.STAFF.SWAP.PAYMENT, element: <TransactionConfirm title='Staff Confirm Transaction' /> },
      { path: PATHS.STAFF.SWAP.HISTORY, element: <TransactionHistory title='Staff Transaction History' /> },
      { path: PATHS.STAFF.INVENTORY.LIST, element: <BatteryList /> },
      { path: PATHS.STAFF.INVENTORY.STATUS, element: <BatteryStatus title='Staff battery status' /> },
      { path: PATHS.STAFF.INVENTORY.SLOT_MANAGE, element: <BatterySlot /> },
      { path: PATHS.STAFF.PROFILE, element: <Profile /> },
    ]
  },
  {
    path: "*",
    element: <ContentError type="404" />,
  }
]);
