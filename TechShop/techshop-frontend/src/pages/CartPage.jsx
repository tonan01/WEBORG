import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Row, Col, Form } from 'react-bootstrap';
import { cartService, orderService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

function CartPage() {
    const { user } = useAuth();
    const { refreshCartCount } = useCart();
    const [cart, setCart] = useState(null);
    const [showCheckout, setShowCheckout] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        shippingAddress: '',
        paymentMethod: 'COD',
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const loadCart = async () => {
        try {
            const res = await cartService.get();
            setCart(res.data);
        } catch (err) {
            console.error('Error loading cart', err);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const handleUpdateQuantity = async (itemId, newQty) => {
        if (newQty < 1) return;
        try {
            await cartService.update(itemId, newQty);
            loadCart();
            refreshCartCount();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating quantity');
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await cartService.remove(itemId);
            loadCart();
            refreshCartCount();
        } catch (err) {
            console.error('Error removing item', err);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await orderService.checkout(checkoutData);
            toast.success('Đặt hàng thành công!');
            setCart(null);
            refreshCartCount();
            navigate('/history');
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Đặt hàng thất bại. Vui lòng kiểm tra kho hàng hoặc đăng nhập.';
            toast.error(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToCheckout = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thanh toán');
            navigate('/login', { state: { from: '/cart' } });
            return;
        }
        setShowCheckout(true);
    };

    if (!cart || cart.items.length === 0) {
        return (
            <Container className="py-5 text-center animate-fade">
                <div className="glass-card p-5">
                    <h2 className="mb-4">Giỏ hàng của bạn đang trống</h2>
                    <Button variant="primary" onClick={() => navigate('/')}>Bắt đầu mua sắm</Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4 animate-fade">
            <h2 className="mb-4 display-6">Giỏ hàng</h2>
            <Row>
                <Col lg={8}>
                    <div className="mb-4">
                        {/* Desktop View Table */}
                        <div className="glass-card p-4 d-none d-md-block">
                            <Table responsive hover className="mb-0">
                                <thead>
                                    <tr>
                                        <th className="border-0">Sản phẩm</th>
                                        <th className="border-0">Giá</th>
                                        <th className="border-0">Số lượng</th>
                                        <th className="border-0 text-end">Tổng cộng</th>
                                        <th className="border-0"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.items.map(item => (
                                        <tr key={item.id}>
                                            <td className="py-3">
                                                <div className="fw-bold">{item.productName}</div>
                                            </td>
                                            <td className="py-3">{formatCurrency(item.unitPrice)}</td>
                                            <td className="py-3">
                                                <div className="d-flex align-items-center">
                                                    <Button size="sm" variant="light" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</Button>
                                                    <span className="mx-3">{item.quantity}</span>
                                                    <Button size="sm" variant="light" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</Button>
                                                </div>
                                            </td>
                                            <td className="py-3 text-end fw-bold">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                            <td className="py-3 text-end">
                                                <Button variant="outline-danger" size="sm" onClick={() => handleRemove(item.id)}>×</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>

                        {/* Mobile View Cards */}
                        <div className="d-md-none">
                            {cart.items.map(item => (
                                <div key={item.id} className="cart-mobile-item glass-card mb-3 p-3 position-relative overflow-hidden">
                                     <div className="d-flex gap-3">
                                        <div className="bg-light rounded p-2 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <span style={{ fontSize: '1.5rem' }}>📱</span>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <h6 className="fw-bold mb-1 pe-4" style={{ fontSize: '1rem' }}>{item.productName}</h6>
                                                <Button variant="link" className="text-danger p-0 position-absolute top-0 end-0 m-2 text-decoration-none" onClick={() => handleRemove(item.id)}>
                                                    <span style={{ fontSize: '1.2rem' }}>×</span>
                                                </Button>
                                            </div>
                                            <div className="text-muted small mb-2">{formatCurrency(item.unitPrice)}</div>
                                            
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <div className="d-flex align-items-center bg-white border rounded-pill p-1 shadow-sm" style={{ width: '120px' }}>
                                                    <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontWeight: 'bold' }} onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</Button>
                                                    <span className="flex-grow-1 text-center fw-bold small">{item.quantity}</span>
                                                    <Button variant="light" className="rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontWeight: 'bold' }} onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</Button>
                                                </div>
                                                <div className="fw-bold text-primary">{formatCurrency(item.unitPrice * item.quantity)}</div>
                                            </div>
                                        </div>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>

                <Col lg={4}>
                    <Card className="glass-card border-0 mb-4">
                        <Card.Body className="p-4">
                            <h4 className="mb-4">Tóm tắt đơn hàng</h4>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tạm tính</span>
                                <span className="fw-bold">{formatCurrency(cart.totalPrice)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Giao hàng</span>
                                <span className="text-success fw-bold">Miễn phí</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <h5 className="mb-0">Tổng cộng</h5>
                                <h5 className="text-primary">{formatCurrency(cart.totalPrice)}</h5>
                            </div>

                            {!showCheckout ? (
                                <Button variant="primary" className="w-100 py-3 shadow" onClick={handleProceedToCheckout}>
                                    Tiến hành thanh toán
                                </Button>
                            ) : (
                                    <Form onSubmit={handleCheckout} className="mt-4">
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Địa chỉ giao hàng</Form.Label>
                                            <Form.Control 
                                                required 
                                                className="bg-transparent"
                                                placeholder="Địa chỉ đầy đủ của bạn..."
                                                value={checkoutData.shippingAddress}
                                                onChange={(e) => setCheckoutData({...checkoutData, shippingAddress: e.target.value})}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Phương thức thanh toán</Form.Label>
                                            <Form.Select 
                                                className="bg-transparent"
                                                value={checkoutData.paymentMethod}
                                                onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                                            >
                                                <option value="COD">Thanh toán khi nhận hàng (Tiền mặt)</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold">Ghi chú đơn hàng</Form.Label>
                                            <Form.Control 
                                                as="textarea"
                                                rows={2}
                                                className="bg-transparent"
                                                placeholder="Hướng dẫn đặc biệt..."
                                                value={checkoutData.note}
                                                onChange={(e) => setCheckoutData({...checkoutData, note: e.target.value})}
                                            />
                                        </Form.Group>
                                        <Button variant="primary" className="w-100 py-3 shadow" type="submit" disabled={loading}>
                                            {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                                        </Button>
                                        <Button variant="link" className="w-100 text-muted mt-2 text-decoration-none" onClick={() => setShowCheckout(false)}>
                                            Quay lại giỏ hàng
                                        </Button>
                                    </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default CartPage;
