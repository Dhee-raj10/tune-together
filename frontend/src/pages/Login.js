import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeSlash } from "react-bootstrap-icons";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await login(email, password);

      if (error) {
        alert(error.message);
      } else {
        alert("Successfully logged in!");
        navigate("/");
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="d-flex flex-grow-1 align-items-center justify-content-center py-5">
        <div className="position-relative w-100 max-w-sm">
          <Card>
            <Card.Header>
              <Card.Title className="text-center">Log In</Card.Title>
              <Card.Text className="text-center text-muted">
                Enter your email and password to log in to your account.
              </Card.Text>
            </Card.Header>
            <Form onSubmit={handleSubmit}>
              <Card.Body>
                <div className="d-grid gap-4">
                  <Form.Group>
                    <Form.Label htmlFor="email">Email</Form.Label>
                    <Form.Control
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group>
                    <Form.Label htmlFor="password">Password</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        variant="link"
                        className="position-absolute end-0 top-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeSlash /> : <Eye />}
                      </Button>
                    </div>
                  </Form.Group>
                </div>
              </Card.Body>
              <Card.Footer className="d-grid gap-4">
                <Button
                  type="submit"
                  className="w-100"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </Button>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup">
                    Sign up
                  </Link>
                </div>
              </Card.Footer>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
