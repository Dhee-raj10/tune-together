import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="text-center">
        <Col>
          <h1 className="display-1 fw-bold">404</h1>
          <p className="h4 text-muted mb-4">Oops! Page not found</p>
          <Button as="a" href="/" variant="link">
            <ArrowLeft className="me-2" />
            Return to Home
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
