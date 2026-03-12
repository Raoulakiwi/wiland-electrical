import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Try demo mode first (bypass auth)
      if (email === 'demo@callpilot.com' && password === 'demo') {
        const demoTenant = {
          id: 'demo-123',
          name: 'Demo Agency',
          brand_name: 'Demo AI Reception',
          email: 'demo@callpilot.com',
          subscription_tier: 'starter'
        };
        localStorage.setItem('token', 'demo-token');
        localStorage.setItem('tenant', JSON.stringify(demoTenant));
        setToken('demo-token');
        navigate('/dashboard');
        return;
      }
      
      // Try real API
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      
      if (!response.ok) {
        // Fall back to demo mode
        throw new Error('Use demo@callpilot.com / demo');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('tenant', JSON.stringify(data.tenant));
      setToken(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      // If API fails, suggest demo
      setError('Invalid credentials. Try: demo@callpilot.com / demo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', padding: '80px 0' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card style={{ background: '#16213e', border: 'none', color: 'white' }}>
              <Card.Body className="p-5">
                <h2 className="text-center mb-4" style={{ color: '#e94560' }}>
                  🔌 CallPilot
                </h2>
                <p className="text-center mb-4 text-muted">Sign in to your agency portal</p>
                
                {error && <Alert variant="warning">{error}</Alert>}
                
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="demo@callpilot.com"
                      style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="demo"
                      style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                      required
                    />
                  </Form.Group>
                  
                  <Button 
                    variant="danger" 
                    type="submit" 
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </Form>
                
                <div className="text-center mt-4 p-3" style={{ background: '#0f3460', borderRadius: '8px' }}>
                  <small className="text-muted">Demo Mode</small>
                  <div style={{ color: '#e94560', fontWeight: 'bold' }}>demo@callpilot.com</div>
                  <small className="text-muted">password: demo</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
