import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Card, Spinner } from 'react-bootstrap';
import { productService, cartService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await productService.getById(id);
                setProduct(res.data);
            } catch (err) {
                console.error('Error fetching product', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleAddToCart = async () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login', { state: { from: `/product/${id}` } });
            return;
        }
        setAdding(true);
        try {
            await cartService.add(product.id, 1);
            toast.success('Đã thêm vào giỏ hàng!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    if (!product) {
        return (
            <Container className="py-5 text-center">
                <h3>Không tìm thấy sản phẩm</h3>
                <Button variant="primary" onClick={() => navigate('/')}>Quay lại trang chủ</Button>
            </Container>
        );
    }

    return (
        <Container className="py-5 animate-fade">
            <Row className="gx-5">
                <Col lg={6} className="mb-4">
                    <div className="glass-card p-2 h-100 overflow-hidden d-flex align-items-center justify-content-center bg-white" style={{ minHeight: '400px' }}>
                        <img 
                            src={product.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                            alt={product.name}
                            className="img-fluid rounded"
                            style={{ maxHeight: '450px', width: 'auto', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
                        />
                    </div>
                </Col>
                <Col lg={6}>
                    <div className="ps-lg-4">
                        <Badge bg="light" text="primary" className="mb-3 px-3 py-2 rounded-pill uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                            {product.categoryName}
                        </Badge>
                        <h1 className="display-5 mb-3">{product.name}</h1>
                        <div className="d-flex align-items-center mb-4">
                            <h2 className="text-primary me-3 mb-0">
                                {new Intl.NumberFormat('vi-VN').format(product.price)} VNĐ
                            </h2>
                            <Badge bg={product.stock > 0 ? 'success' : 'danger'} className="rounded-pill px-3">
                                {product.stock > 0 ? `${product.stock} trong kho` : 'Hết hàng'}
                            </Badge>
                        </div>
                        
                        <div className="glass-card p-4 mb-4">
                            <h5 className="mb-3">Mô tả</h5>
                            <p className="text-muted leading-relaxed">
                                {product.description || "Trải nghiệm sự hoàn hảo với thiết bị mới nhất của chúng tôi. Được thiết kế tối ưu cho hiệu năng và phong cách, sản phẩm này đặt ra một tiêu chuẩn mới trong ngành."}
                            </p>
                        </div>

                        <div className="mb-5">
                            <h6 className="text-muted small mb-3">Mã sản phẩm (SKU): {product.sku}</h6>
                            <Row className="g-3">
                                <Col sm={6}>
                                    <Button 
                                        variant="primary" 
                                        className="w-100 py-3 shadow" 
                                        disabled={product.stock <= 0 || adding}
                                        onClick={handleAddToCart}
                                    >
                                        {adding ? 'Đang thêm...' : '🛒 Thêm vào giỏ'}
                                    </Button>
                                </Col>
                                <Col sm={6}>
                                    <Button 
                                        variant="outline-dark" 
                                        className="w-100 py-3" 
                                        onClick={() => navigate('/')}
                                    >
                                        🛍️ Tiếp tục mua sắm
                                    </Button>
                                </Col>
                            </Row>
                        </div>

                        <Card className="glass-card border-0 bg-transparent">
                            <Card.Body className="d-flex align-items-center py-4">
                                <div className="me-3 bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                    <i className="bi bi-shield-check"></i> 🛡️
                                </div>
                                <div>
                                    <h6 className="mb-1">Bảo hành chính hãng</h6>
                                    <small className="text-muted">Bảo hành 12 tháng từ TechShop</small>
                                </div>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Container>
    );
}

export default ProductDetailPage;
