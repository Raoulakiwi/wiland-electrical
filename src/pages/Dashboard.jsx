import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [tenant, setTenant] = useState(null);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, trial: 0, calls: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const tenantData = localStorage.getItem('tenant');
    
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (tenantData) {
      setTenant(JSON.parse(tenantData));
    }
    
    fetchClients(token);
  }, [navigate]);

  const fetchClients = async (token) => {
    try {
      const response = await fetch('/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        
        setStats({
          total: data.length,
          active: data.filter(c => c.status === 'active').length,
          trial: data.filter(c => c.status === 'trial').length,
          calls: 0  // TODO: fetch from calls endpoint
        });
      }
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenant');
    navigate('/login');
  };

  if (!tenant) return null;

  return (
    <div style={{ background: '#1a1a2e', minHeight: '100vh', padding: '20px 0' }}>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 style={{ color: '#e94560', marginBottom: 0 }}>🔌 CallPilot</h2>
                <small className="text-muted">{tenant.brand_name || tenant.name}</small>
              </div>
              <div>
                <Button variant="outline-light" size="sm" onClick={handleLogout} className="me-2">
                  Logout
                </Button>
                <Button variant="danger" size="sm" onClick={() => navigate('/clients/new')}>
                  + Add Client
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <Card style={{ background: '#16213e', border: 'none' }}>
              <Card.Body className="text-center">
                <h1 style={{ color: '#e94560' }}>{stats.total}</h1>
                <p className="text-muted mb-0">Total Clients</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ background: '#16213e', border: 'none' }}>
              <Card.Body className="text-center">
                <h1 style={{ color: '#28a745' }}>{stats.active}</h1>
                <p className="text-muted mb-0">Active</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ background: '#16213e', border: 'none' }}>
              <Card.Body className="text-center">
                <h1 style={{ color: '#ffc107' }}>{stats.trial}</h1>
                <p className="text-muted mb-0">Trial</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ background: '#16213e', border: 'none' }}>
              <Card.Body className="text-center">
                <h1 style={{ color: '#17a2b8' }}>{stats.calls}</h1>
                <p className="text-muted mb-0">Calls This Month</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Clients Table */}
        <Row>
          <Col>
            <Card style={{ background: '#16213e', border: 'none', color: 'white' }}>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Your Clients</span>
                <Button variant="outline-light" size="sm" onClick={() => navigate('/clients/new')}>
                  + Add New
                </Button>
              </Card.Header>
              <Card.Body>
                {clients.length === 0 ? (
                  <div className="text-center py-5">
                    <h4 className="text-muted">No clients yet</h4>
                    <p>Add your first client to get started</p>
                    <Button variant="danger" onClick={() => navigate('/clients/new')}>
                      Add Client
                    </Button>
                  </div>
                ) : (
                  <Table variant="dark" responsive>
                    <thead>
                      <tr>
                        <th>Business</th>
                        <th>Contact</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map(client => (
                        <tr key={client.id}>
                          <td>{client.business_name}</td>
                          <td>{client.contact_name || '-'}</td>
                          <td>{client.phone_number || '-'}</td>
                          <td>
                            <Badge bg={client.status === 'active' ? 'success' : 'warning'}>
                              {client.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-light" size="sm" className="me-2">
                              Edit
                            </Button>
                            <Button variant="outline-info" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;
