import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Table } from 'react-bootstrap';
import PaginationComponent from '../components/PaginationComponent';
import { orderService } from '../services/api';

function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadOrders = async (page = 1) => {
        setLoading(true);
        try {
            const res = await orderService.getHistory(page, 5); // 5 đơn hàng mỗi trang cho lịch sử
            setOrders(res.data.items);
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.pageNumber);
        } catch (err) {
            console.error('Error loading history', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders(1);
    }, []);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            loadOrders(page);
        }
    };

    if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

    return (
        <Container className="py-4 animate-fade">
            <h2 className="mb-4 display-6">Đơn hàng của tôi</h2>
            {orders.length === 0 ? (
                <div className="glass-card p-5 text-center">
                    <p className="text-muted">Bạn chưa có đơn hàng nào.</p>
                </div>
            ) : (
                <>
                    {orders.map(order => (
                        <Card key={order.id} className="glass-card border-0 mb-4 overflow-hidden">
                            <Card.Header className="bg-transparent border-0 d-flex justify-content-between align-items-center pt-4 px-4">
                                <div>
                                    <span className="text-muted small">Mã đơn hàng: </span>
                                    <span className="fw-bold">#ORD-{order.id}</span>
                                    <div className="text-muted small">{new Date(order.orderDate).toLocaleDateString()}</div>
                                </div>
                                <Badge bg={
                                    order.status === 'Pending' ? 'warning' : 
                                    order.status === 'Shipped' ? 'info' : 
                                    order.status === 'Delivered' ? 'success' : 'danger'
                                } className="rounded-pill px-3 py-2">
                                    {
                                        order.status === 'Pending' ? 'Chờ xử lý' : 
                                        order.status === 'Shipped' ? 'Đang giao' : 
                                        order.status === 'Delivered' ? 'Đã giao' : 'Đã hủy'
                                    }
                                </Badge>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <Row className="mb-3">
                                    <Col md={8}>
                                        <h6 className="text-muted mb-3">Sản phẩm đã đặt</h6>
                                        {order.details.map((detail, idx) => (
                                            <div key={idx} className="d-flex justify-content-between mb-2">
                                                <span>{detail.productName} <span className="text-muted small">x{detail.quantity}</span></span>
                                                <span className="fw-bold">{new Intl.NumberFormat('vi-VN').format(detail.unitPrice * detail.quantity)} VNĐ</span>
                                            </div>
                                        ))}
                                    </Col>
                                    <Col md={4} className="border-start ps-4">
                                        <h6 className="text-muted mb-2">Thông tin giao hàng</h6>
                                        <div className="small mb-2">{order.shippingAddress}</div>
                                        <div className="small text-primary fw-bold">Thanh toán: {
                                            order.paymentMethod === 'COD' ? 'Thanh toán trực tiếp' :
                                            order.paymentMethod === 'BankTransfer' ? 'Chuyển khoản' : 'Thẻ tín dụng'
                                        }</div>
                                    </Col>
                                </Row>
                                <hr />
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="h5 mb-0">Tổng số tiền</span>
                                    <span className="h4 text-primary mb-0">{new Intl.NumberFormat('vi-VN').format(order.totalAmount)} VNĐ</span>
                                </div>
                            </Card.Body>
                        </Card>
                    ))}
                    <PaginationComponent 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </Container>
    );
}

export default OrderHistoryPage;
