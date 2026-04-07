import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Button, Modal, Form, Card, Row, Col, Table } from 'react-bootstrap';
import { productService, categoryService, orderService, uploadService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

// Sub-components
import AdminProductTab from './admin/AdminProductTab';
import AdminCategoryTab from './admin/AdminCategoryTab';
import AdminOrderTab from './admin/AdminOrderTab';
import AdminUserTab from './admin/AdminUserTab';

function AdminPage() {
    const [products, setProducts] = useState([]);
    const [prodPage, setProdPage] = useState(1);
    const [prodTotalPages, setProdTotalPages] = useState(1);
    const [prodFilter, setProdFilter] = useState('all'); // all, active, deleted
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [orderPage, setOrderPage] = useState(1);
    const [orderTotalPages, setOrderTotalPages] = useState(1);
    const [orderStatus, setOrderStatus] = useState(''); // Empty string means all
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [uploading, setUploading] = useState(false);

    // Modal States
    const [showProdModal, setShowProdModal] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Product Form States
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: 0, stock: 0, sku: '', imageUrl: '', categoryId: ''
    });

    // Category Form States
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '', description: '', imageUrl: '', parentCategoryId: ''
    });

    const loadData = async () => {
        try {
            const [prodRes, catRes, orderRes, statsRes] = await Promise.all([
                productService.getAllWithDeleted(prodPage, 10),
                categoryService.getAll(),
                orderService.getAll(orderStatus, orderPage, 10),
                orderService.getAdminStats()
            ]);
            setProducts(prodRes.data.items);
            setProdTotalPages(prodRes.data.totalPages);
            setCategories(catRes.data);
            setOrders(orderRes.data.items);
            setOrderTotalPages(orderRes.data.totalPages);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error loading admin data', err);
            toast.error(err.response?.data?.message || err.response?.data || 'Không thể tải dữ liệu quản trị');
        }
    };

    useEffect(() => {
        loadData();
    }, [prodPage, orderPage, orderStatus]);

    // --- Product Handlers ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadService.uploadImage(file);
            setProductForm({ ...productForm, imageUrl: res.data.url });
            toast.success('Image uploaded to Cloudinary!');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Image upload failed';
            toast.error(msg);
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleCategoryImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadService.uploadImage(file);
            setCategoryForm({ ...categoryForm, imageUrl: res.data.url });
            toast.success('Category image uploaded!');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Image upload failed';
            toast.error(msg);
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...productForm,
                price: Number(productForm.price),
                stock: Number(productForm.stock),
                categoryId: Number(productForm.categoryId)
            };
            
            if (editingProduct) {
                await productService.update(editingProduct.id, data);
                toast.success('Product updated successfully!');
            } else {
                await productService.create(data);
                toast.success('Product created successfully!');
            }
            setShowProdModal(false);
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to save product';
            toast.error(msg);
        }
    };

    const deleteProduct = async (id) => {
        try {
            await productService.remove(id);
            toast.success('Product deleted!');
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Cannot delete product (likely in orders)';
            toast.error(msg);
            console.error('Delete error:', err);
        }
    };

    const restoreProduct = async (id) => {
        try {
            await productService.restore(id);
            toast.success('Product restored!');
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to restore product';
            toast.error(msg);
        }
    };

    // --- Category Handlers ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const data = { ...categoryForm, parentCategoryId: categoryForm.parentCategoryId || null };
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, data);
                toast.success('Category updated!');
            } else {
                await categoryService.create(data);
                toast.success('Category created!');
            }
            setShowCatModal(false);
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to save category';
            toast.error(msg);
        }
    };

    const deleteCategory = async (id) => {
        try {
            await categoryService.remove(id);
            toast.success('Category deleted!');
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Cannot delete category (likely contains products or subcategories)';
            toast.error(msg);
        }
    };

    // --- Order Handlers ---
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success('Order status updated!');
            loadData();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Failed to update order status';
            toast.error(msg);
        }
    };

    return (
        <Container className="py-4 animate-fade">
            <h2 className="mb-4 display-6">Bảng điều khiển quản trị</h2>
            
            <div className="glass-card mb-4 overflow-hidden">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="border-0 p-2 custom-tabs border-bottom"
                >
                    <Tab eventKey="products" title="Sản phẩm">
                        <AdminProductTab 
                            products={products}
                            prodFilter={prodFilter}
                            setProdFilter={setProdFilter}
                            setProdPage={setProdPage}
                            prodPage={prodPage}
                            prodTotalPages={prodTotalPages}
                            setEditingProduct={setEditingProduct}
                            setProductForm={setProductForm}
                            setShowProdModal={setShowProdModal}
                            deleteProduct={deleteProduct}
                            restoreProduct={restoreProduct}
                        />
                    </Tab>

                    <Tab eventKey="categories" title="Danh mục">
                        <AdminCategoryTab 
                            categories={categories}
                            setEditingCategory={setEditingCategory}
                            setCategoryForm={setCategoryForm}
                            setShowCatModal={setShowCatModal}
                            deleteCategory={deleteCategory}
                        />
                    </Tab>

                    <Tab eventKey="orders" title="Đơn hàng khách hàng">
                        <AdminOrderTab 
                            orders={orders}
                            orderPage={orderPage}
                            setOrderPage={setOrderPage}
                            orderTotalPages={orderTotalPages}
                            orderStatus={orderStatus}
                            setOrderStatus={setOrderStatus}
                            loadData={loadData}
                            handleUpdateOrderStatus={handleUpdateOrderStatus}
                            setSelectedOrder={setSelectedOrder}
                            setShowOrderModal={setShowOrderModal}
                        />
                    </Tab>

                    <Tab eventKey="users" title="Người dùng">
                        <AdminUserTab />
                    </Tab>

                    <Tab eventKey="dashboard" title="Tổng quan">
                        <div className="p-4">
                            {stats ? (
                                <>
                                    <Row className="mb-4">
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Tổng doanh thu</div>
                                                    <h3 className="text-primary mb-0">{new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)} VNĐ</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Tổng đơn hàng</div>
                                                    <h3 className="text-success mb-0">{stats.totalOrders}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Sản phẩm</div>
                                                    <h3 className="text-info mb-0">{stats.totalProducts}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Danh mục</div>
                                                    <h3 className="text-purple mb-0" style={{ color: '#a855f7' }}>{stats.totalCategories}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Card className="border-0 shadow-sm p-4 mb-4">
                                        <h5 className="mb-4">Tăng trưởng doanh thu hàng tháng</h5>
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={stats.monthlyRevenue}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${new Intl.NumberFormat('vi-VN').format(val)} VNĐ`} />
                                                    <Tooltip 
                                                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                    />
                                                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                                                        {stats.monthlyRevenue.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={index === stats.monthlyRevenue.length - 1 ? '#6366f1' : '#cbd5e1'} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </>
                            ) : (
                                <div className="text-center py-5">Loading stats...</div>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>
            
            {/* View Order Modal */}
            <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>Chi tiết đơn hàng #ORD-{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    {selectedOrder && (
                        <Row>
                            <Col md={7}>
                                <h6 className="text-primary mb-3">Sản phẩm đã mua</h6>
                                <Table size="sm" borderless>
                                    <tbody>
                                        {selectedOrder.details.map((d, i) => (
                                            <tr key={i} className="border-bottom pb-2">
                                                <td className="py-2"><b>{d.productName}</b> <br/> <small className="text-muted">Qty: {d.quantity}</small></td>
                                                <td className="text-end py-2">{new Intl.NumberFormat('vi-VN').format(d.unitPrice)} VNĐ</td>
                                                <td className="text-end py-2 fw-bold">{new Intl.NumberFormat('vi-VN').format(d.unitPrice * d.quantity)} VNĐ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className="d-flex justify-content-between h5 mt-4">
                                    <span>Tổng cộng:</span>
                                    <span className="text-primary">{new Intl.NumberFormat('vi-VN').format(selectedOrder.totalAmount)} VNĐ</span>
                                </div>
                            </Col>
                            <Col md={5} className="border-start ps-4">
                                <h6 className="text-primary mb-3">Thông tin khách hàng</h6>
                                <p className="mb-1 fw-bold">Địa chỉ giao nhận:</p>
                                <p className="text-muted small mb-3">{selectedOrder.shippingAddress}</p>
                                <p className="mb-1 fw-bold">Phương thức thanh toán:</p>
                                <p className="text-muted small mb-3">{selectedOrder.paymentMethod}</p>
                                <p className="mb-1 fw-bold">Ghi chú từ khách hàng:</p>
                                <p className="text-muted small">{selectedOrder.note || 'Không có ghi chú.'}</p>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>
           
            {/* Category Modal */}
            <Modal show={showCatModal} onHide={() => setShowCatModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>{editingCategory ? 'Sửa Danh mục' : 'Thêm Danh mục'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCategorySubmit}>
                    <Modal.Body className="px-4">
                        <Form.Group className="mb-3"><Form.Control placeholder="Tên danh mục" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required /></Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Select value={categoryForm.parentCategoryId} onChange={e => setCategoryForm({...categoryForm, parentCategoryId: e.target.value})}>
                                <option value="">Không có (Danh mục gốc)</option>
                                {categories.filter(c => c.id !== editingCategory?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3"><Form.Control as="textarea" placeholder="Mô tả" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold">Hình ảnh danh mục</Form.Label>
                            <div className="d-flex gap-2 align-items-start mb-2">
                                <div className="flex-grow-1">
                                    <Form.Control 
                                        placeholder="Đường dẫn ảnh (URL)" 
                                        value={categoryForm.imageUrl || ''} 
                                        onChange={e => setCategoryForm({...categoryForm, imageUrl: e.target.value})} 
                                    />
                                </div>
                                {categoryForm.imageUrl && (
                                    <img 
                                        src={categoryForm.imageUrl} 
                                        alt="Preview" 
                                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                        className="border"
                                        onError={(e) => { e.target.src = 'https://placehold.co/100?text=Error'; }}
                                    />
                                )}
                            </div>
                            <Form.Control 
                                type="file" 
                                accept="image/*"
                                onChange={handleCategoryImageUpload}
                                disabled={uploading}
                            />
                            {uploading && <div className="small text-primary mt-1">Đang tải lên Cloudinary...</div>}
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowCatModal(false)}>Hủy</Button>
                        <Button variant="primary" type="submit">Lưu Danh mục</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Product Modal */}
            <Modal show={showProdModal} onHide={() => setShowProdModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>{editingProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleProductSubmit}>
                    <Modal.Body className="px-4">
                        <Row>
                            <Col md={12}><Form.Group className="mb-3"><Form.Control placeholder="Tên sản phẩm" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control placeholder="Mã SKU" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} required /></Form.Group></Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} required>
                                        <option value="">Chọn Danh mục</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control type="number" placeholder="Giá" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control type="number" placeholder="Số lượng kho" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} required /></Form.Group></Col>
                            <Col md={12}><Form.Group className="mb-3"><Form.Control as="textarea" placeholder="Mô tả sản phẩm" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /></Form.Group></Col>
                            <Col md={12}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Hình ảnh sản phẩm</Form.Label>
                                    <div className="d-flex gap-2 align-items-start">
                                        <div className="flex-grow-1">
                                            <Form.Control 
                                                placeholder="Đường dẫn ảnh (URL)" 
                                                value={productForm.imageUrl} 
                                                onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} 
                                            />
                                            <Form.Text className="text-muted">Hoặc tải lên file mới bên dưới</Form.Text>
                                        </div>
                                        {productForm.imageUrl && (
                                            <img 
                                                src={productForm.imageUrl} 
                                                alt="Preview" 
                                                style={{ width: '60px', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                                                className="border"
                                                onError={(e) => { e.target.src = 'https://placehold.co/100?text=Error'; }}
                                            />
                                        )}
                                    </div>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Control 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    {uploading && <div className="small text-primary mt-1">Đang tải lên Cloudinary...</div>}
                                </Form.Group>
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowProdModal(false)}>Hủy</Button>
                        <Button variant="primary" type="submit">Lưu Sản phẩm</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default AdminPage;
