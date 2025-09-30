import AdminNavbar from "./navbar/AdminNavbar";
import AuthorizedLayout from "./AuthorizedLayout";

const AdminLayout = () => (
  <AuthorizedLayout Navbar={AdminNavbar} />
);

export default AdminLayout;