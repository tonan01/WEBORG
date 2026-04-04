import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Card, Spinner } from 'react-bootstrap';
import { productService, cartService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

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
            alert('Please login to add to cart');
            navigate('/login');
            return;
        }
        setAdding(true);
        try {
            await cartService.add(product.id, 1);
            alert('Added to cart!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error adding to cart');
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
                <h3>Product not found</h3>
                <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
            </Container>
        );
    }

    return (
        <Container className="py-5 animate-fade">
            <Row className="gx-5">
                <Col lg={6} className="mb-4">
                    <div className="glass-card p-2 h-100 overflow-hidden d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
                        <div style={{ width: '100%', height: '100%', background: 'var(--secondary-gradient)', opacity: 0.1, borderRadius: '12px' }}></div>
                        <div className="position-absolute text-center">
                            <h1 className="display-1 text-primary opacity-25">PREMIUM</h1>
                        </div>
                    </div>
                </Col>
                <Col lg={6}>
                    <div className="ps-lg-4">
                        <Badge bg="light" text="primary" className="mb-3 px-3 py-2 rounded-pill uppercase fw-bold" style={{ letterSpacing: '1px' }}>
                            {product.categoryName}
                        </Badge>
                        <h1 className="display-5 mb-3">{product.name}</h1>
                        <div className="d-flex align-items-center mb-4">
                            <h2 className="text-primary me-3 mb-0">${product.price}</h2>
                            <Badge bg={product.stock > 0 ? 'success' : 'danger'} className="rounded-pill px-3">
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                            </Badge>
                        </div>
                        
                        <div className="glass-card p-4 mb-4">
                            <h5 className="mb-3">Description</h5>
                            <p className="text-muted leading-relaxed">
                                {product.description || "Experience perfection with our latest gadget. Engineered for performance and designed for style, this product sets a new standard in the industry."}
                            </p>
                        </div>

                        <div className="mb-5">
                            <h6 className="text-muted small mb-3">Product SKU: {product.sku}</h6>
                            <Row className="g-3">
                                <Col sm={6}>
                                    <Button 
                                        variant="primary" 
                                        size="lg" 
                                        className="w-100 py-3 shadow" 
                                        disabled={product.stock <= 0 || adding}
                                        onClick={handleAddToCart}
                                    >
                                        {adding ? 'Adding...' : 'Add to Cart'}
                                    </Button>
                                </Col>
                                <Col sm={6}>
                                    <Button variant="outline-dark" size="lg" className="w-100 py-3" onClick={() => navigate('/')}>
                                        Continue Shopping
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
                                    <h6 className="mb-1">Genuine Warranty</h6>
                                    <small className="text-muted">12 months official warranty from TechShop</small>
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
