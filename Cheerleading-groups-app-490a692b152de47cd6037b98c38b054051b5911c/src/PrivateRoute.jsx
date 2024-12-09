import { Navigate } from "react-router-dom";
import { useAuth } from "./contexts/authContext";
function PrivateRoute({ element }) {
  const { userLoggedIn } = useAuth();

  return userLoggedIn ? element : <Navigate to="/login" />;
}

export default PrivateRoute;