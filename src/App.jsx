import { RouterProvider } from "react-router-dom";
import { router } from "@/routers";
import GlobalErrorBoundary from "./components/ui/GlobalErrorBoundary";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <GlobalErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </GlobalErrorBoundary>
  );
}

export default App;
