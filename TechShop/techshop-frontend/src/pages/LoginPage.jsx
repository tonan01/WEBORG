import React, { useState, useContext } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password);
            toast.success('Signed in successfully!');
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5 animate-fade">
            <Row className="justify-content-center">
                <Col md={5}>
                    <Card className="glass-card p-4">
                        <Card.Body>
                            <div className="text-center mb-4">
                                <h1 className="display-6">Welcome Back</h1>
                                <p className="text-muted">Sign in to continue to TechShop</p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Control 
                                        className="bg-transparent rounded-3 py-2"
                                        type="text" 
                                        placeholder="Username"
                                        required 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Control 
                                        className="bg-transparent rounded-3 py-2"
                                        type="password" 
                                        placeholder="Password"
                                        required 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                </Form.Group>
                                <Button className="w-100 py-2 mb-3" type="submit" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                                <div className="text-center">
                                    <span className="text-muted small">Don't have an account? </span>
                                    <Link to="/register" className="text-primary small text-decoration-none fw-bold">Register now</Link>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default LoginPage;
