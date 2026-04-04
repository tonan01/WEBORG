import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Card, Row, Col, Form } from 'react-bootstrap';
import { cartService, orderService } from '../services/api';
import { useNavigate } from 'react-router-dom';

function CartPage() {
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
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating quantity');
        }
    };

    const handleRemove = async (itemId) => {
        try {
            await cartService.remove(itemId);
            loadCart();
        } catch (err) {
            console.error('Error removing item', err);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await orderService.checkout(checkoutData);
            alert('Order placed successfully!');
            setCart(null);
            navigate('/history');
        } catch (err) {
            alert(err.response?.data || 'Checkout failed. Please check stock or login.');
        } finally {
            setLoading(false);
        }
    };

    if (!cart || cart.items.length === 0) {
        return (
            <Container className="py-5 text-center animate-fade">
                <div className="glass-card p-5">
                    <h2 className="mb-4">Your cart is empty</h2>
                    <Button variant="primary" onClick={() => navigate('/')}>Start Shopping</Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4 animate-fade">
            <h2 className="mb-4 display-6">Shopping Cart</h2>
            <Row>
                <Col lg={8}>
                    <div className="glass-card p-4 mb-4">
                        <Table responsive hover className="mb-0">
                            <thead>
                                <tr>
                                    <th className="border-0">Product</th>
                                    <th className="border-0">Price</th>
                                    <th className="border-0">Quantity</th>
                                    <th className="border-0 text-end">Total</th>
                                    <th className="border-0"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="py-3">
                                            <div className="fw-bold">{item.productName}</div>
                                        </td>
                                        <td className="py-3">${item.unitPrice}</td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center">
                                                <Button size="sm" variant="light" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>-</Button>
                                                <span className="mx-3">{item.quantity}</span>
                                                <Button size="sm" variant="light" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>+</Button>
                                            </div>
                                        </td>
                                        <td className="py-3 text-end fw-bold">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                                        <td className="py-3 text-end">
                                            <Button variant="outline-danger" size="sm" onClick={() => handleRemove(item.id)}>×</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </Col>

                <Col lg={4}>
                    <Card className="glass-card border-0 mb-4">
                        <Card.Body className="p-4">
                            <h4 className="mb-4">Order Summary</h4>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Subtotal</span>
                                <span className="fw-bold">${cart.totalPrice.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Shipping</span>
                                <span className="text-success fw-bold">Free</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <h5 className="mb-0">Total</h5>
                                <h5 className="text-primary">${cart.totalPrice.toFixed(2)}</h5>
                            </div>

                            {!showCheckout ? (
                                <Button variant="primary" className="w-100 py-3 shadow" onClick={() => setShowCheckout(true)}>
                                    Proceed to Checkout
                                </Button>
                            ) : (
                                <Form onSubmit={handleCheckout} className="mt-4">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Shipping Address</Form.Label>
                                        <Form.Control 
                                            required 
                                            className="bg-transparent"
                                            placeholder="Your full address..."
                                            value={checkoutData.shippingAddress}
                                            onChange={(e) => setCheckoutData({...checkoutData, shippingAddress: e.target.value})}
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold">Payment Method</Form.Label>
                                        <Form.Select 
                                            className="bg-transparent"
                                            value={checkoutData.paymentMethod}
                                            onChange={(e) => setCheckoutData({...checkoutData, paymentMethod: e.target.value})}
                                        >
                                            <option value="COD">Cash on Delivery (COD)</option>
                                            <option value="BankTransfer">Bank Transfer</option>
                                            <option value="CreditCard">Credit Card</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold">Order Notes</Form.Label>
                                        <Form.Control 
                                            as="textarea"
                                            rows={2}
                                            className="bg-transparent"
                                            placeholder="Special instructions..."
                                            value={checkoutData.note}
                                            onChange={(e) => setCheckoutData({...checkoutData, note: e.target.value})}
                                        />
                                    </Form.Group>
                                    <Button variant="primary" className="w-100 py-3 shadow" type="submit" disabled={loading}>
                                        {loading ? 'Processing...' : 'Place Order Now'}
                                    </Button>
                                    <Button variant="link" className="w-100 text-muted mt-2 text-decoration-none" onClick={() => setShowCheckout(false)}>
                                        Back to Cart
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
