import React, { useState, useEffect } from 'react';
import { Container, Tabs, Tab, Table, Button, Form, Modal, Row, Col, Badge } from 'react-bootstrap';
import { productService, categoryService } from '../services/api';

function AdminPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');

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
            const [pRes, cRes, oRes] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
                orderService.getAll()
            ]);
            setProducts(pRes.data);
            setCategories(cRes.data);
            setOrders(oRes.data);
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
            if (editingProduct) {
                await productService.update(editingProduct.id, productForm);
            } else {
                await productService.create(productForm);
            }
            setShowProdModal(false);
            loadData();
        } catch (err) {
            alert('Failed to save product');
        }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await productService.remove(id);
            loadData();
        } catch (err) {
            alert('Cannot delete product (likely in orders)');
        }
    };

    // --- Category Handlers ---
    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const data = { ...categoryForm, parentCategoryId: categoryForm.parentCategoryId || null };
        try {
            if (editingCategory) {
                await categoryService.update(editingCategory.id, data);
            } else {
                await categoryService.create(data);
            }
            setShowCatModal(false);
            loadData();
        } catch (err) {
            alert('Failed to save category');
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Delete this category?')) return;
        try {
            await categoryService.remove(id);
            loadData();
        } catch (err) {
            alert('Cannot delete category (contains products or sub-categories)');
        }
    };

    // --- Order Handlers ---
    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            alert('Order status updated!');
            loadData();
        } catch (err) {
            alert('Failed to update order status');
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
                            <div className="d-flex justify-content-between mb-4">
                                <h5>Products ({products.length})</h5>
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
                                    {products.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <div className="fw-bold">{p.name}</div>
                                                <div className="small text-muted">{p.sku}</div>
                                            </td>
                                            <td><Badge bg="light" text="primary" className="rounded-pill p-1 px-3">{p.categoryName}</Badge></td>
                                            <td className="fw-bold">${p.price}</td>
                                            <td>
                                                <Badge bg={p.stock < 5 ? 'warning' : 'light'} text={p.stock < 5 ? 'white' : 'dark'}>{p.stock}</Badge>
                                            </td>
                                            <td>
                                                <Button size="sm" variant="outline-info" className="me-2" onClick={() => {
                                                    setEditingProduct(p);
                                                    setProductForm(p);
                                                    setShowProdModal(true);
                                                }}>Edit</Button>
                                                <Button size="sm" variant="outline-danger" onClick={() => deleteProduct(p.id)}>Del</Button>
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
