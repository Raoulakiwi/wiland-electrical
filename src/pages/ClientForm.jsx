import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

function ClientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    business_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    phone_number: '',
    greeting_message: "Hello, you've reached our office. How can I help you today?",
    voice_personality: 'professional',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    
    try {
      const url = isEdit 
        ? `http://localhost:8000/clients/${id}`
        : 'http://localhost:8000/clients';
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save client');
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', padding: '40px 0' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card style={{ background: '#16213e', border: 'none', color: 'white' }}>
              <Card.Body className="p-5">
                <h2 className="text-center mb-4" style={{ color: '#e94560' }}>
                  {isEdit ? '✏️ Edit Client' : '➕ Add New Client'}
                </h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <h5 className="mb-3" style={{ color: '#e94560' }}>Business Information</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Business Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.business_name}
                      onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                      placeholder="Acme Electrical"
                      style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                      required
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.contact_name}
                          onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                          placeholder="John Smith"
                          style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Contact Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                          placeholder="+61 400 123 456"
                          style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Contact Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                      placeholder="john@acme.com"
                      style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                    />
                  </Form.Group>
                  
                  <hr style={{ borderColor: '#0f3460' }} />
                  
                  <h5 className="mb-3" style={{ color: '#e94560' }}>AI Configuration</h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                      placeholder="+61 2 1234 5678"
                      style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                    />
                    <Form.Text className="text-muted">
                      Twilio phone number for this client
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Greeting Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={formData.greeting_message}
                      onChange={(e) => setFormData({...formData, greeting_message: e.target.value})}
                      style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                    />
                    <Form.Text className="text-muted">
                      What the AI says when answering calls
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Voice Personality</Form.Label>
                    <Form.Select
                      value={formData.voice_personality}
                      onChange={(e) => setFormData({...formData, voice_personality: e.target.value})}
                      style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                    >
                      <option value="professional">Professional & Polite</option>
                      <option value="friendly">Friendly & Casual</option>
                      <option value="formal">Formal & Corporate</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                      Cancel
                    </Button>
                    <Button variant="danger" type="submit" disabled={loading}>
                      {loading ? 'Saving...' : isEdit ? 'Update Client' : 'Add Client'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ClientForm;
