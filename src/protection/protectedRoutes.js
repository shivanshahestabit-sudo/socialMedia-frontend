import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  useEffect(() => {
    if (!user || !token) {
      navigate("/");
    }
  }, [user, token, navigate]);

  if (!user || !token) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
