import { useRouteError, useNavigate } from 'react-router-dom';
import { Container, Alert, Button } from 'react-bootstrap';

function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('Route error:', error);

  return (
    <Container className="mt-5">
      <Alert variant="danger">
        <Alert.Heading>Oops! Something went wrong</Alert.Heading>
        <p>
          {error?.message || 'An unexpected error occurred'}
        </p>
        {error?.stack && process.env.NODE_ENV === 'development' && (
          <details className="mt-3">
            <summary>Error details (development only)</summary>
            <pre className="mt-2" style={{ fontSize: '0.85rem' }}>
              {error.stack}
            </pre>
          </details>
        )}
        <hr />
        <div className="d-flex gap-2">
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button variant="outline-primary" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </Alert>
    </Container>
  );
}

export default ErrorBoundary;
