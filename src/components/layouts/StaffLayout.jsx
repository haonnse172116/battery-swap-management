import AuthorizedLayout from "./AuthorizedLayout";
import StaffNavbar from "./navbar/StaffNavbar";

const StaffLayout = () => (
  <AuthorizedLayout Navbar={StaffNavbar} />
);

export default StaffLayout;