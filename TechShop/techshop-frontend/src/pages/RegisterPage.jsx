import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-hot-toast';

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.register(formData);
            toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Đăng ký thất bại. Tên đăng nhập hoặc Email có thể đã tồn tại.';
            toast.error(errorMsg);
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
                                <h1 className="display-6">Gia nhập TechShop</h1>
                                <p className="text-muted">Thiết bị cao cấp dành riêng cho bạn</p>
                            </div>
                            
                            <Form onSubmit={handleRegister}>
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Thông tin người dùng</Form.Label>
                                            <Form.Control 
                                                className="bg-transparent rounded-3"
                                                name="fullName" 
                                                placeholder="Họ và tên của bạn"
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
                                                placeholder="Tên đăng nhập"
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
                                                placeholder="Mật khẩu"
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
                                                placeholder="Địa chỉ Email"
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
                                                placeholder="Số điện thoại"
                                                onChange={handleChange} 
                                                required 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Button className="w-100 py-2 mb-3" type="submit" disabled={loading}>
                                    {loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
                                </Button>
                                
                                <div className="text-center">
                                    <span className="text-muted small">Đã có tài khoản? </span>
                                    <Link to="/login" className="text-primary small text-decoration-none fw-bold">Đăng nhập tại đây</Link>
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
