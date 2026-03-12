import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, ProgressBar, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    services: {
      emergency: false,
      installations: false,
      repairs: false,
      maintenance: false,
      inspections: false,
      other: ''
    },
    hours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' },
    },
    emergencyAfterHours: false,
    existingNumber: '',
    wantNewNumber: true,
    voiceGreeting: "Hello, you've reached Wiland Electrical. How can I help you today?",
    voicePersonality: 'professional',
    notifyTime: '18:00',
    phases: {
      phase1: false,
      phase2: false,
      phase3: false,
      phase4: false
    }
  });
  
  const [submitted, setSubmitted] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('services.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        services: { ...prev.services, [key]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };
  
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const progress = (step / 4) * 100;
  
  const phases = [
    { id: 'phase1', name: 'Phase 1: Voice Reception', desc: 'Basic call answering & FAQ' },
    { id: 'phase2', name: 'Phase 2: Booking', desc: 'Appointment scheduling' },
    { id: 'phase3', name: 'Phase 3: Notifications', desc: 'Daily summaries & CRM' },
    { id: 'phase4', name: 'Phase 4: Advanced', desc: 'Voicemail, quotes, multilingual' }
  ];
  
  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', padding: '40px 0' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card style={{ background: '#16213e', border: 'none', color: 'white' }}>
              <Card.Body className="p-5">
                <h2 className="text-center mb-4" style={{ color: '#e94560' }}>
                  ⚡ Wiland Electrical - Setup
                </h2>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <small>Progress</small>
                    <small>{Math.round(progress)}%</small>
                  </div>
                  <ProgressBar now={progress} style={{ height: '8px', background: '#0f3460' }} variant="danger" />
                </div>
                
                <Alert variant="info" style={{ background: '#0f3460', border: 'none' }}>
                  <h5 className="mb-3">📋 Project Status</h5>
                  {phases.map(phase => (
                    <div key={phase.id} className="d-flex align-items-center mb-2">
                      <Form.Check
                        type="checkbox"
                        id={phase.id}
                        name={`phases.${phase.id}`}
                        checked={formData.phases[phase.id]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          phases: { ...prev.phases, [phase.id]: e.target.checked }
                        }))}
                        className="me-2"
                      />
                      <label htmlFor={phase.id} style={{ cursor: 'pointer', marginBottom: 0 }}>
                        <strong>{phase.name}</strong> - {phase.desc}
                      </label>
                    </div>
                  ))}
                </Alert>
                
                {!submitted ? (
                  <Form onSubmit={handleSubmit}>
                    {step === 1 && (
                      <>
                        <h4 className="mb-4">📍 Business Information</h4>
                        <Form.Group className="mb-3">
                          <Form.Label>Business Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="Wiland Electrical"
                            style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                          />
                        </Form.Group>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Owner Name</Form.Label>
                              <Form.Control
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Phone</Form.Label>
                              <Form.Control
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label>Address</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                          />
                        </Form.Group>
                      </>
                    )}
                    
                    {step === 2 && (
                      <>
                        <h4 className="mb-4">🔧 Services Offered</h4>
                        <Row>
                          {['emergency', 'installations', 'repairs', 'maintenance', 'inspections'].map(service => (
                            <Col md={6} key={service}>
                              <Form.Check
                                type="checkbox"
                                id={service}
                                name={`services.${service}`}
                                checked={formData.services[service]}
                                onChange={handleChange}
                                label={service.charAt(0).toUpperCase() + service.slice(1)}
                                className="mb-3"
                              />
                            </Col>
                          ))}
                        </Row>
                        <Form.Group className="mb-4">
                          <Form.Label>Other Services</Form.Label>
                          <Form.Control
                            type="text"
                            name="services.other"
                            value={formData.services.other}
                            onChange={handleChange}
                            placeholder="Any other services..."
                            style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                          />
                        </Form.Group>
                      </>
                    )}
                    
                    {step === 3 && (
                      <>
                        <h4 className="mb-4">🕐 Operating Hours</h4>
                        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                          <Row key={day} className="mb-2">
                            <Col md={3}><strong style={{ textTransform: 'capitalize' }}>{day}</strong></Col>
                            <Col md={4}>
                              <Form.Control
                                type="time"
                                size="sm"
                                value={formData.hours[day].open}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  hours: { ...prev.hours, [day]: { ...prev.hours[day], open: e.target.value } }
                                }))}
                                style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                              />
                            </Col>
                            <Col md={1} className="text-center">-</Col>
                            <Col md={4}>
                              <Form.Control
                                type="time"
                                size="sm"
                                value={formData.hours[day].close}
                                onChange={(e) => setFormData(prev => ({
                                  ...prev,
                                  hours: { ...prev.hours, [day]: { ...prev.hours[day], close: e.target.value } }
                                }))}
                                style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                              />
                            </Col>
                          </Row>
                        ))}
                        <Form.Check
                          type="checkbox"
                          id="emergencyAfterHours"
                          name="emergencyAfterHours"
                          checked={formData.emergencyAfterHours}
                          onChange={handleChange}
                          label="Offer emergency after-hours service?"
                          className="mt-3 mb-4"
                        />
                        
                        <h4 className="mb-4">📞 Phone Number</h4>
                        <Form.Check
                          type="radio"
                          id="wantNewNumber"
                          name="wantNewNumber"
                          checked={formData.wantNewNumber}
                          onChange={() => setFormData(prev => ({ ...prev, wantNewNumber: true }))}
                          label="Get a new number"
                          className="mb-2"
                        />
                        <Form.Check
                          type="radio"
                          id="existingNumber"
                          name="wantNewNumber"
                          checked={!formData.wantNewNumber}
                          onChange={() => setFormData(prev => ({ ...prev, wantNewNumber: false }))}
                          label="Use existing number"
                          className="mb-3"
                        />
                        {!formData.wantNewNumber && (
                          <Form.Group>
                            <Form.Control
                              type="tel"
                              name="existingNumber"
                              value={formData.existingNumber}
                              onChange={handleChange}
                              placeholder="+61..."
                              style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                            />
                          </Form.Group>
                        )}
                      </>
                    )}
                    
                    {step === 4 && (
                      <>
                        <h4 className="mb-4">🎤 Voice AI Configuration</h4>
                        <Form.Group className="mb-3">
                          <Form.Label>Greeting Message</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            name="voiceGreeting"
                            value={formData.voiceGreeting}
                            onChange={handleChange}
                            style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                          />
                          <Form.Text className="text-muted">Using MiniMax Speech 2.6 for natural voice</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label>Voice Personality</Form.Label>
                          <Form.Select
                            name="voicePersonality"
                            value={formData.voicePersonality}
                            onChange={handleChange}
                            style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                          >
                            <option value="professional">Professional & Polite</option>
                            <option value="friendly">Friendly & Casual</option>
                            <option value="formal">Formal & Corporate</option>
                          </Form.Select>
                        </Form.Group>
                        
                        <h4 className="mb-4">🔔 Notifications</h4>
                        <Form.Group className="mb-3">
                          <Form.Label>Daily Summary Time</Form.Label>
                          <Form.Control
                            type="time"
                            name="notifyTime"
                            value={formData.notifyTime}
                            onChange={handleChange}
                            style={{ background: '#0f3460', border: '1px solid #e94560', color: 'white' }}
                          />
                        </Form.Group>
                      </>
                    )}
                    
                    <div className="d-flex justify-content-between mt-4">
                      {step > 1 && (
                        <Button variant="secondary" onClick={prevStep}>← Back</Button>
                      )}
                      <div className="ms-auto">
                        {step < 4 ? (
                          <Button variant="danger" onClick={nextStep}>Next →</Button>
                        ) : (
                          <Button variant="success" type="submit">Submit ✓</Button>
                        )}
                      </div>
                    </div>
                  </Form>
                ) : (
                  <Alert variant="success" className="text-center">
                    <h4>✅ Setup Complete!</h4>
                    <p>Your Wiland Electrical AI call centre is being configured.</p>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
