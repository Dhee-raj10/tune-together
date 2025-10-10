import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Form, Card } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeSlash } from "react-bootstrap-icons";


const Signup = () => {
  // FIX: Change state name from fullName to username, which the backend expects.
  const [username, setUsername] = useState(""); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // FIX: The backend `signup` function in AuthContext expects (username, email, password).
      // The old version passed (email, password, fullName).
      const { error } = await signup(username, email, password); 

      if (error) {
        // FIX: The error is a simple string message from AuthContext.
        alert(error); 
      } else {
        alert("Successfully signed up!");
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
              <Card.Title className="text-center">Sign Up</Card.Title>
              <Card.Text className="text-center text-muted">
                Enter your details to create a new account.
              </Card.Text>
            </Card.Header>
            <Form onSubmit={handleSubmit}>
              <Card.Body>
                <div className="d-grid gap-4">
                  <Form.Group>
                    {/* FIX: Change label and id to reflect username */}
                    <Form.Label htmlFor="username">Username</Form.Label> 
                    <Form.Control
                      id="username"
                      type="text"
                      placeholder="john_doe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>
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
                  <Form.Group>
                    <Form.Check
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      label={
                        <>
                          I accept the <Link to="/terms">terms of service</Link> and <Link to="/privacy">privacy policy</Link>
                        </>
                      }
                      required
                    />
                  </Form.Group>
                </div>
              </Card.Body>
              <Card.Footer className="d-grid gap-4">
                <Button
                  type="submit"
                  className="w-100"
                  disabled={!termsAccepted || isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link to="/login">
                    Log in
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

export default Signup;
