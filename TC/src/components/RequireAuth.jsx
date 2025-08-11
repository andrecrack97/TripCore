import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) {
    // Guarda a dónde quería ir para volver después del login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
