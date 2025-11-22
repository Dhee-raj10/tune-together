import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Card } from "react-bootstrap";
import { Eye, EyeSlash } from "react-bootstrap-icons";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const checkProfile = async (user) => {
    try {
      const inst = await api.get("/musicians/my-instruments");
      const profile = await api.get(`/profiles/${user.id || user._id}`);

      const hasInst = inst.data?.instruments?.length;
      const hasRoles = profile.data?.roles?.length;

      if (!hasInst || !hasRoles) {
        if (window.confirm("Your profile isn't complete. Finish now?")) {
          navigate("/profile");
        } else navigate("/explore");
      } else navigate("/explore");
    } catch {
      navigate("/explore");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error, user } = await login(email, password);
      if (error) alert(error);
      else {
        alert("Logged in!");
        await checkProfile(user);
      }
    } catch {
      alert("Unexpected error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 shadow-sm mt-4">
      <h3 className="fw-bold mb-2">Log In</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3 position-relative">
          <Form.Label>Password</Form.Label>
          <Form.Control type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
          <Button variant="link" className="position-absolute end-0 top-0" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeSlash /> : <Eye />}
          </Button>
        </Form.Group>

        <Button className="w-100" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log In"}
        </Button>

        <div className="text-center mt-2">
          New here? <Link to="/signup">Sign Up</Link>
        </div>
      </Form>
    </Card>
  );
};

export default Login;
