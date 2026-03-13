import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login({ setToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        // Registration
        const res = await fetch('https://callpilot-backend-98t8.onrender.com/api/register', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({name, email, password})
        });
        if (!res.ok) throw new Error('Registration failed');
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('tenant', JSON.stringify(data.tenant));
        setToken(data.access_token);
        navigate('/dashboard');
        return;
      }
      
      // Demo mode
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
      
      // Real API login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      
      const response = await fetch('https://callpilot-backend-98t8.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      });
      
      if (!response.ok) throw new Error('Invalid credentials');
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('tenant', JSON.stringify(data.tenant));
      setToken(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
                <p className="text-center mb-4 text-muted">
                  {isRegister ? 'Create your agency account' : 'Sign in to your agency portal'}
                </p>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  {isRegister && (
                    <Form.Group className="mb-3">
                      <Form.Label>Agency Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Agency Name"
                        style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                        required={isRegister}
                      />
                    </Form.Group>
                  )}
                  
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
                      placeholder="••••••••"
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
                    {loading ? (isRegister ? 'Creating Account...' : 'Signing in...') : (isRegister ? 'Create Account' : 'Sign In')}
                  </Button>
                </Form>
                
                <p className="text-center mt-4 text-muted">
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <span 
                    style={{ color: '#e94560', cursor: 'pointer' }} 
                    onClick={() => setIsRegister(!isRegister)}
                  >
                    {isRegister ? ' Sign in' : ' Sign up'}
                  </span>
                </p>
                
                {!isRegister && (
                  <div className="text-center mt-3 p-3" style={{ background: '#0f3460', borderRadius: '8px' }}>
                    <small className="text-muted">Demo Mode</small>
                    <div style={{ color: '#e94560', fontWeight: 'bold' }}>demo@callpilot.com</div>
                    <small className="text-muted">password: demo</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
