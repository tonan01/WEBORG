import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Table, Button, Modal, Form, Badge, Card, Row, Col } from 'react-bootstrap';
import { productService, categoryService, orderService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'react-hot-toast';

function AdminPage() {
    console.log('AdminPage Component Rendering...');
    const [products, setProducts] = useState([]);
    const [prodFilter, setProdFilter] = useState('all'); // all, active, deleted
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');

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
                productService.getAllWithDeleted(),
                categoryService.getAll(),
                orderService.getAll(),
                orderService.getAdminStats()
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setOrders(orderRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Error loading admin data', err);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- Product Handlers ---
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
            toast.error('Failed to save product');
        }
    };

    const deleteProduct = async (id) => {
        try {
            await productService.remove(id);
            toast.success('Product deleted!');
            loadData();
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Cannot delete product (likely in orders)');
        }
    };

    const restoreProduct = async (id) => {
        try {
            await productService.restore(id);
            toast.success('Product restored!');
            loadData();
        } catch (err) {
            toast.error('Failed to restore product');
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
            toast.error('Failed to save category');
        }
    };

    const deleteCategory = async (id) => {
        try {
            await categoryService.remove(id);
            toast.success('Category deleted!');
            loadData();
        } catch (err) {
            toast.error('Cannot delete category (likely contains products or subcategories)');
        }
    };

    // --- Order Handlers ---
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            toast.success('Order status updated!');
            loadData();
        } catch (err) {
            toast.error('Failed to update order status');
        }
    };

    return (
        <Container className="py-4 animate-fade">
            <h2 className="mb-4 display-6">Admin Control Panel</h2>
            
            <div className="glass-card mb-4 overflow-hidden">
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="border-0 p-2 custom-tabs border-bottom"
                >
                    <Tab eventKey="products" title="Products">
                        <div className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                <div className="d-flex align-items-center gap-3">
                                    <h5 className="mb-0">Products ({products.length})</h5>
                                    <Form.Select 
                                        size="sm" 
                                        style={{ width: '150px' }}
                                        value={prodFilter}
                                        onChange={(e) => setProdFilter(e.target.value)}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active Only</option>
                                        <option value="deleted">Deleted Only</option>
                                    </Form.Select>
                                </div>
                                <Button variant="primary" onClick={() => {
                                    setEditingProduct(null);
                                    setProductForm({ name: '', description: '', price: 0, stock: 0, sku: '', imageUrl: '', categoryId: '' });
                                    setShowProdModal(true);
                                }}>+ New Product</Button>
                            </div>
                            <Table responsive hover className="align-middle">
                                <thead className="bg-light text-muted small uppercase">
                                    <tr>
                                        <th>SKU/Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products
                                        .filter(p => {
                                            if (prodFilter === 'active') return !p.isDeleted;
                                            if (prodFilter === 'deleted') return p.isDeleted;
                                            return true;
                                        })
                                        .map(p => (
                                        <tr key={p.id} className={p.isDeleted ? 'table-light opacity-75' : ''}>
                                            <td>
                                                <div className={`fw-bold ${p.isDeleted ? 'text-decoration-line-through text-danger' : ''}`}>
                                                    {p.name} 
                                                    {p.isDeleted && <Badge bg="secondary" className="ms-1">Deleted</Badge>}
                                                </div>
                                                <div className="small text-muted">{p.sku}</div>
                                            </td>
                                            <td><Badge bg="light" text="primary" className="rounded-pill p-1 px-3">{p.categoryName}</Badge></td>
                                            <td className={`fw-bold ${p.isDeleted ? 'text-decoration-line-through' : ''}`}>${p.price}</td>
                                            <td>
                                                <Badge bg={p.stock < 5 ? 'warning' : 'light'} text={p.stock < 5 ? 'white' : 'dark'}>{p.stock}</Badge>
                                            </td>
                                            <td>
                                                {!p.isDeleted ? (
                                                    <>
                                                        <Button size="sm" variant="outline-info" className="me-2" onClick={() => {
                                                            setEditingProduct(p);
                                                            setProductForm({
                                                                ...p,
                                                                categoryId: p.categoryId || ''
                                                            });
                                                            setShowProdModal(true);
                                                        }}>Edit</Button>
                                                        <Button size="sm" variant="outline-danger" onClick={() => deleteProduct(p.id)}>Delete</Button>
                                                    </>
                                                ) : (
                                                    <Button size="sm" variant="outline-success" onClick={() => restoreProduct(p.id)}>Restore</Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Tab>

                    <Tab eventKey="categories" title="Categories">
                        <div className="p-4">
                            <div className="d-flex justify-content-between mb-4">
                                <h5>Categories ({categories.length})</h5>
                                <Button variant="primary" onClick={() => {
                                    setEditingCategory(null);
                                    setCategoryForm({ name: '', description: '', imageUrl: '', parentCategoryId: '' });
                                    setShowCatModal(true);
                                }}>+ New Category</Button>
                            </div>
                            <Table responsive hover className="align-middle">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Parent</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map(c => (
                                        <tr key={c.id}>
                                            <td className="fw-bold">{c.name}</td>
                                            <td>{c.parentCategoryName || <span className="text-muted small">Root</span>}</td>
                                            <td className="small text-muted">{c.description || '-'}</td>
                                            <td>
                                                <Button size="sm" variant="outline-info" className="me-2" onClick={() => {
                                                    setEditingCategory(c);
                                                    setCategoryForm({ ...c, parentCategoryId: c.parentCategoryId || '' });
                                                    setShowCatModal(true);
                                                }}>Edit</Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => deleteCategory(c.id)}>Del</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Tab>

                    <Tab eventKey="orders" title="Client Orders">
                        <div className="p-4">
                            <div className="d-flex justify-content-between mb-4">
                                <h5>All Orders ({orders.length})</h5>
                                <Button variant="outline-secondary" onClick={loadData}>Refresh</Button>
                            </div>
                            <Table responsive hover className="align-middle">
                                <thead className="bg-light text-muted small uppercase">
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Total</th>
                                        <th>Update Status</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td className="fw-bold text-muted">#ORD-{o.id}</td>
                                            <td className="small">{new Date(o.orderDate).toLocaleDateString()}</td>
                                            <td>
                                                <Badge bg={
                                                    o.status === 'Pending' ? 'warning' : 
                                                    o.status === 'Shipped' ? 'info' : 
                                                    o.status === 'Delivered' ? 'success' : 'danger'
                                                } className="rounded-pill px-3">
                                                    {o.status}
                                                </Badge>
                                            </td>
                                            <td className="fw-bold text-primary">${o.totalAmount}</td>
                                            <td style={{ width: '180px' }}>
                                                <Form.Select 
                                                    size="sm" 
                                                    className="bg-light rounded-pill px-3 border-0"
                                                    value={o.status}
                                                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </Form.Select>
                                            </td>
                                            <td>
                                                <Button size="sm" variant="outline-dark" onClick={() => {
                                                    setSelectedOrder(o);
                                                    setShowOrderModal(true);
                                                }}>View Detail</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Tab>

                    <Tab eventKey="dashboard" title="Dashboard">
                        <div className="p-4">
                            {stats ? (
                                <>
                                    <Row className="mb-4">
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Total Revenue</div>
                                                    <h3 className="text-primary mb-0">${stats.totalRevenue.toLocaleString()}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Total Orders</div>
                                                    <h3 className="text-success mb-0">{stats.totalOrders}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Products</div>
                                                    <h3 className="text-info mb-0">{stats.totalProducts}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="text-center border-0 bg-light shadow-sm mb-3">
                                                <Card.Body>
                                                    <div className="text-muted small mb-1">Categories</div>
                                                    <h3 className="text-purple mb-0" style={{ color: '#a855f7' }}>{stats.totalCategories}</h3>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <Card className="border-0 shadow-sm p-4 mb-4">
                                        <h5 className="mb-4">Monthly Revenue Growth</h5>
                                        <div style={{ width: '100%', height: 300 }}>
                                            <ResponsiveContainer>
                                                <BarChart data={stats.monthlyRevenue}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
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
                    <Modal.Title>Order Detail #ORD-{selectedOrder?.id}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    {selectedOrder && (
                        <Row>
                            <Col md={7}>
                                <h6 className="text-primary mb-3">Items Purchased</h6>
                                <Table size="sm" borderless>
                                    <tbody>
                                        {selectedOrder.details.map((d, i) => (
                                            <tr key={i} className="border-bottom pb-2">
                                                <td className="py-2"><b>{d.productName}</b> <br/> <small className="text-muted">Qty: {d.quantity}</small></td>
                                                <td className="text-end py-2">${d.unitPrice}</td>
                                                <td className="text-end py-2 fw-bold">${d.unitPrice * d.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div className="d-flex justify-content-between h5 mt-4">
                                    <span>Grand Total:</span>
                                    <span className="text-primary">${selectedOrder.totalAmount}</span>
                                </div>
                            </Col>
                            <Col md={5} className="border-start ps-4">
                                <h6 className="text-primary mb-3">Customer Info</h6>
                                <p className="mb-1 fw-bold">Shipping Address:</p>
                                <p className="text-muted small mb-3">{selectedOrder.shippingAddress}</p>
                                <p className="mb-1 fw-bold">Payment Method:</p>
                                <p className="text-muted small mb-3">{selectedOrder.paymentMethod}</p>
                                <p className="mb-1 fw-bold">Notes from customer:</p>
                                <p className="text-muted small">{selectedOrder.note || 'No notes left.'}</p>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
            </Modal>
           
            {/* Category Modal */}
            <Modal show={showCatModal} onHide={() => setShowCatModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>{editingCategory ? 'Edit Category' : 'New Category'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleCategorySubmit}>
                    <Modal.Body className="px-4">
                        <Form.Group className="mb-3"><Form.Control placeholder="Category Name" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required /></Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Select value={categoryForm.parentCategoryId} onChange={e => setCategoryForm({...categoryForm, parentCategoryId: e.target.value})}>
                                <option value="">No Parent (Root)</option>
                                {categories.filter(c => c.id !== editingCategory?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3"><Form.Control as="textarea" placeholder="Description" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} /></Form.Group>
                        <Form.Group className="mb-3"><Form.Control placeholder="Image URL" value={categoryForm.imageUrl} onChange={e => setCategoryForm({...categoryForm, imageUrl: e.target.value})} /></Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowCatModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Category</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Product Modal */}
            <Modal show={showProdModal} onHide={() => setShowProdModal(false)} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title>{editingProduct ? 'Edit Product' : 'New Product'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleProductSubmit}>
                    <Modal.Body className="px-4">
                        <Row>
                            <Col md={12}><Form.Group className="mb-3"><Form.Control placeholder="Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control placeholder="SKU" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} required /></Form.Group></Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control type="number" placeholder="Price" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required /></Form.Group></Col>
                            <Col md={6}><Form.Group className="mb-3"><Form.Control type="number" placeholder="Stock" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} required /></Form.Group></Col>
                            <Col md={12}><Form.Group className="mb-3"><Form.Control as="textarea" placeholder="Description" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} /></Form.Group></Col>
                            <Col md={12}><Form.Group className="mb-3"><Form.Control placeholder="Image URL" value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} /></Form.Group></Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="light" onClick={() => setShowProdModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Product</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default AdminPage;
