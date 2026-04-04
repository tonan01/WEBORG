import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Table } from 'react-bootstrap';
import { orderService } from '../services/api';

function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const res = await orderService.getHistory();
                setOrders(res.data);
            } catch (err) {
                console.error('Error loading history', err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <Container className="py-4 animate-fade">
            <h2 className="mb-4 display-6">My Orders</h2>
            {orders.length === 0 ? (
                <div className="glass-card p-5 text-center">
                    <p className="text-muted">You haven't placed any orders yet.</p>
                </div>
            ) : (
                orders.map(order => (
                    <Card key={order.id} className="glass-card border-0 mb-4 overflow-hidden">
                        <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
                            <div>
                                <span className="text-muted small">Order ID: </span>
                                <span className="fw-bold">#ORD-{order.id}</span>
                                <div className="text-muted small">{new Date(order.orderDate).toLocaleDateString()}</div>
                            </div>
                            <Badge bg={order.status === 'Pending' ? 'warning' : 'success'} className="rounded-pill px-3 py-2">
                                {order.status}
                            </Badge>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Row className="mb-3">
                                <Col md={8}>
                                    <h6 className="text-muted mb-3">Items Ordered</h6>
                                    {order.details.map((detail, idx) => (
                                        <div key={idx} className="d-flex justify-content-between mb-2">
                                            <span>{detail.productName} <span className="text-muted small">x{detail.quantity}</span></span>
                                            <span className="fw-bold">${(detail.unitPrice * detail.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </Col>
                                <Col md={4} className="border-start ps-4">
                                    <h6 className="text-muted mb-2">Delivery Details</h6>
                                    <div className="small mb-2">{order.shippingAddress}</div>
                                    <div className="small text-primary fw-bold">Payment: {order.paymentMethod}</div>
                                </Col>
                            </Row>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="h5 mb-0">Total Amount</span>
                                <span className="h4 text-primary mb-0">${order.totalAmount.toFixed(2)}</span>
                            </div>
                        </Card.Body>
                    </Card>
                ))
            )}
        </Container>
    );
}

export default OrderHistoryPage;
