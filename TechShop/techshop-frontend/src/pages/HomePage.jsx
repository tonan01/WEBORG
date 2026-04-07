import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Row, Col, Form, InputGroup, Container, Badge } from 'react-bootstrap';
import PaginationComponent from '../components/PaginationComponent';
import { useNavigate } from 'react-router-dom';
import { productService, cartService, categoryService } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const buildCategoryTree = (flatCategories) => {
        const map = {};
        const roots = [];
        
        flatCategories.forEach(cat => {
            map[cat.id] = { ...cat, children: [] };
        });
        
        flatCategories.forEach(cat => {
            if (cat.parentCategoryId) {
                if (map[cat.parentCategoryId]) {
                    map[cat.parentCategoryId].children.push(map[cat.id]);
                }
            } else {
                roots.push(map[cat.id]);
            }
        });
        return roots;
    };

    const loadData = async (page = 1) => {
        setLoading(true);
        try {
            const [prodRes, catRes] = await Promise.all([
                productService.getAll(keyword, selectedCategory, page, 12),
                categoryService.getAll()
            ]);
            // Backend trả về PagedResult { items, totalCount, pageNumber, pageSize, totalPages }
            setProducts(prodRes.data.items);
            setTotalPages(prodRes.data.totalPages);
            setCurrentPage(prodRes.data.pageNumber);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Error loading data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData(1);
    }, [selectedCategory]);

    const handleSearch = (e) => {
        e.preventDefault();
        loadData(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            loadData(page);
        }
    };

    const handleAddToCart = async (productId) => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            navigate('/login', { state: { from: '/' } });
            return;
        }
        try {
            await cartService.add(productId, 1);
            toast.success('Đã thêm vào giỏ hàng!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    };

    return (
        <Container className="py-4 animate-fade">
            <Row>
                {/* Sidebar Categories */}
                <Col md={3} className="mb-4">
                    <div className="glass-card p-3 sticky-top" style={{ top: '100px', zIndex: 10 }}>
                        <h5 className="mb-3 px-2">Danh mục</h5>
                        {selectedCategory === null ? (
                            <div 
                                className="category-item active"
                                onClick={() => setSelectedCategory(null)}
                            >
                                Tất cả sản phẩm
                            </div>
                        ) : (
                            <div 
                                className="category-item"
                                onClick={() => setSelectedCategory(null)}
                            >
                                Tất cả sản phẩm
                            </div>
                        )}

                        {buildCategoryTree(categories).map(cat => (
                            <div key={cat.id}>
                                <div 
                                    className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </div>
                                {cat.children.length > 0 && cat.children.map(child => (
                                    <div 
                                        key={child.id} 
                                        className={`category-item small ps-4 ${selectedCategory === child.id ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(child.id)}
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        — {child.name}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </Col>

                {/* Main Content */}
                <Col md={9}>
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                        <h2 className="mb-3">
                            {selectedCategory 
                                ? categories.find(c => c.id === selectedCategory)?.name 
                                : 'Tất cả thiết bị'}
                        </h2>
                        
                        <Form onSubmit={handleSearch} className="mb-3">
                            <InputGroup className="glass-card" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <Form.Control 
                                    className="border-0 bg-transparent py-2 px-3"
                                    placeholder="Tìm kiếm thiết bị..." 
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                                <Button type="submit" variant="primary" style={{ borderRadius: '0 12px 12px 0' }}>
                                    Tìm kiếm
                                </Button>
                            </InputGroup>
                        </Form>
                    </div>
                    
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status"></div>
                        </div>
                    ) : (
                        <>
                            <Row>
                            {products.length === 0 ? (
                                <Col className="text-center py-5">
                                    <p className="text-muted">Không tìm thấy thiết bị nào trong danh mục này.</p>
                                </Col>
                            ) : products.map(p => (
                                <Col lg={4} md={6} key={p.id} className="mb-4">
                                    <Card className="glass-card h-100 border-0 overflow-hidden shadow-hover">
                                        <div 
                                            onClick={() => navigate(`/product/${p.id}`)}
                                            className="overflow-hidden d-flex align-items-center justify-content-center bg-light"
                                            style={{ height: '220px', cursor: 'pointer' }}
                                        >
                                            <img 
                                                src={p.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                                                alt={p.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                className="product-card-img"
                                                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
                                            />
                                        </div>
                                        <Card.Body className="pt-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <Card.Title 
                                                    className="mb-0 text-truncate" 
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => navigate(`/product/${p.id}`)}
                                                >
                                                    {p.name}
                                                </Card.Title>
                                                <Badge bg="light" text="primary" className="rounded-pill">{p.categoryName}</Badge>
                                            </div>
                                            <Card.Text className="text-muted small mb-3" style={{ height: '40px', overflow: 'hidden' }}>
                                                {p.description}
                                            </Card.Text>
                                             <div className="d-flex justify-content-between align-items-center">
                                                <h4 className="text-primary mb-0">
                                                    {new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ
                                                </h4>
                                                <span className="small text-muted">{p.stock} trong kho</span>
                                            </div>
                                        </Card.Body>
                                        <Card.Footer className="bg-transparent border-0 pb-3 p-3">
                                            <div className="d-grid gap-2">
                                                <Button 
                                                    variant="primary" 
                                                    onClick={() => handleAddToCart(p.id)}
                                                    disabled={p.stock <= 0}
                                                >
                                                    {p.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                                                </Button>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => navigate(`/product/${p.id}`)}
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        <PaginationComponent 
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            size="md"
                        />
                    </>
                )}
                </Col>
            </Row>
        </Container>
    );
}

export default HomePage;
