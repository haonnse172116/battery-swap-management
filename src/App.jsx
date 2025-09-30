import { RouterProvider } from "react-router-dom";
import { router } from "@/routers";
import GlobalErrorBoundary from "./components/ui/GlobalErrorBoundary";

function App() {
  return (
    <GlobalErrorBoundary>
      <RouterProvider router={router} />
    </GlobalErrorBoundary>
  );
}

export default App;
