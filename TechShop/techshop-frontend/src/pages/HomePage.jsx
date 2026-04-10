import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, InputGroup, Container, Badge } from 'react-bootstrap';
import { Search, Plus, PackageSearch } from 'lucide-react';
import PaginationComponent from '../components/PaginationComponent';
import { useNavigate } from 'react-router-dom';
import { authService, productService, cartService, categoryService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../utils/formatters';

function HomePage() {
    const [products, setProducts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { refreshCartCount } = useCart();
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
            refreshCartCount();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng');
        }
    };

    return (
        <Container className="py-4 animate-fade">
            <Row>
                {/* Categories - Mobile Pill View & Desktop Sidebar */}
                <Col md={3} className="mb-4">
                    <div className="glass-card p-3 sticky-top d-none d-md-block" style={{ top: '100px', zIndex: 10 }}>
                        <h5 className="mb-3 px-2">Danh mục</h5>
                        <div className="categories-container">
                            <div 
                                className={`category-item ${selectedCategory === null ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                Tất cả sản phẩm
                            </div>

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
                    </div>

                    {/* Mobile Pill Scroll */}
                    <div className="d-md-none mb-3">
                        <div className="category-pills-container">
                            <div 
                                className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(null)}
                            >
                                Tất cả
                            </div>
                            {categories.map(cat => (
                                <div 
                                    key={cat.id}
                                    className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.name}
                                </div>
                            ))}
                        </div>
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
                                <Button type="submit" variant="primary" style={{ borderRadius: '0 12px 12px 0' }} className="d-flex align-items-center gap-2 px-3">
                                    <Search size={18} color="white" strokeWidth={2} />
                                    <span className="d-none d-sm-inline">Tìm kiếm</span>
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
                                <Col className="text-center py-5 d-flex flex-column align-items-center">
                                    <div className="bg-light p-4 rounded-circle mb-4 text-muted opacity-50">
                                        <PackageSearch size={64} />
                                    </div>
                                    <p className="text-muted">Không tìm thấy thiết bị nào trong danh mục này.</p>
                                </Col>
                            ) : products.map(p => (
                                <Col lg={4} md={6} xs={6} key={p.id} className="mb-3 mb-md-4 px-2 px-md-3">
                                    <Card className="glass-card h-100 border-0 overflow-hidden shadow-hover">
                                        <div 
                                            onClick={() => navigate(`/product/${p.id}`)}
                                            className="overflow-hidden d-flex align-items-center justify-content-center bg-light"
                                            style={{ height: '180px', cursor: 'pointer' }}
                                        >
                                            <img 
                                                src={p.imageUrl || 'https://placehold.co/600x400?text=No+Image'} 
                                                alt={p.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                                className="product-card-img"
                                                onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
                                            />
                                        </div>
                                        <Card.Body className="p-2 p-md-3 d-flex flex-column h-100" onClick={() => navigate(`/product/${p.id}`)} style={{ cursor: 'pointer' }}>
                                            <div className="mb-auto">
                                                <small className="text-muted opacity-75" style={{ fontSize: '0.7rem' }}>{p.categoryName}</small>
                                                <Card.Title 
                                                    className="mb-1 text-truncate h6 fw-bold" 
                                                    style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', whiteSpace: 'normal', height: '2.5rem', overflow: 'hidden' }}
                                                >
                                                    {p.name}
                                                </Card.Title>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <span className="fw-bold text-primary" style={{ fontSize: '0.95rem' }}>
                                                    {formatCurrency(p.price)}
                                                </span>
                                                <Button 
                                                    variant="primary" 
                                                    size="sm" 
                                                    className="rounded-circle p-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: '32px', height: '32px' }}
                                                    onClick={(e) => { e.stopPropagation(); handleAddToCart(p.id); }}
                                                    disabled={p.stock <= 0}
                                                >
                                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', lineHeight: 1 }}>+</span>
                                                </Button>
                                            </div>
                                        </Card.Body>

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
