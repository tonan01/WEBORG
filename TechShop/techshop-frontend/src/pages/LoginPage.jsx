import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(username, password);
            toast.success('Đăng nhập thành công!');
            navigate('/');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            toast.error(errorMsg);
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
                                <h1 className="display-6">Chào mừng trở lại</h1>
                                <p className="text-muted">Đăng nhập để tiếp tục với TechShop</p>
                            </div>

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Control 
                                        className="bg-transparent rounded-3 py-2"
                                        type="text" 
                                        placeholder="Tên đăng nhập"
                                        required 
                                        value={username} 
                                        onChange={(e) => setUsername(e.target.value)} 
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Control 
                                        className="bg-transparent rounded-3 py-2"
                                        type="password" 
                                        placeholder="Mật khẩu"
                                        required 
                                        value={password} 
                                        onChange={(e) => setPassword(e.target.value)} 
                                    />
                                </Form.Group>
                                <Button className="w-100 py-2 mb-3" type="submit" disabled={loading}>
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Button>
                                <div className="text-center">
                                    <span className="text-muted small">Chưa có tài khoản? </span>
                                    <Link to="/register" className="text-primary small text-decoration-none fw-bold">Đăng ký ngay</Link>
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
