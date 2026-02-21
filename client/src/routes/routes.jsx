import { createBrowserRouter } from "react-router-dom";
import Unauthorized from "../pages/Auth/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../Layout/Layout";
import CreateCompanyQR from "../pages/CRMPanel/CreateCompanyQR";
import Login from "../pages/Auth/Login";
import NotFound from "./NotFound";

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [{ path: "/qr-generation", element: <CreateCompanyQR /> }],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);
