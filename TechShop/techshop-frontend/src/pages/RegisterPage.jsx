import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.register(formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Username may exist.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5 animate-fade">
            <Row className="justify-content-center">
                <Col md={6}>
                    <Card className="glass-card p-4">
                        <Card.Body>
                            <div className="text-center mb-4">
                                <h1 className="display-6">Join TechShop</h1>
                                <p className="text-muted">High-end gadgets specifically for you</p>
                            </div>
                            
                            {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                            
                            <Form onSubmit={handleRegister}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>User Information</Form.Label>
                                            <Form.Control 
                                                className="bg-transparent rounded-3"
                                                name="fullName" 
                                                placeholder="Your Full Name"
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Control 
                                                className="bg-transparent rounded-3"
                                                name="username" 
                                                placeholder="Username"
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Control 
                                                className="bg-transparent rounded-3"
                                                type="password" 
                                                name="password" 
                                                placeholder="Password"
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Control 
                                                className="bg-transparent rounded-3"
                                                type="email" 
                                                name="email" 
                                                placeholder="Email Address"
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-4">
                                            <Form.Control 
                                                className="bg-transparent rounded-3"
                                                name="phone" 
                                                placeholder="Phone Number"
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Button className="w-100 py-2 mb-3" type="submit" disabled={loading}>
                                    {loading ? 'Creating Account...' : 'Register Now'}
                                </Button>
                                
                                <div className="text-center">
                                    <span className="text-muted small">Already have an account? </span>
                                    <Link to="/login" className="text-primary small text-decoration-none fw-bold">Login here</Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default RegisterPage;
