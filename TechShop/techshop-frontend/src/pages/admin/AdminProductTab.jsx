import React from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import PaginationComponent from '../../components/PaginationComponent';

const AdminProductTab = ({ 
    products, 
    prodFilter, 
    setProdFilter, 
    setProdPage, 
    prodPage, 
    prodTotalPages,
    setEditingProduct,
    setProductForm,
    setShowProdModal,
    deleteProduct,
    restoreProduct
}) => {
    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                    <h5 className="mb-0">Sản phẩm ({products.length})</h5>
                    <Form.Select 
                        size="sm" 
                        style={{ width: '150px' }}
                        value={prodFilter}
                        onChange={(e) => {
                            setProdFilter(e.target.value);
                            setProdPage(1);
                        }}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="deleted">Đã xóa</option>
                    </Form.Select>
                </div>
                <Button variant="primary" onClick={() => {
                    setEditingProduct(null);
                    setProductForm({ name: '', description: '', price: 0, stock: 0, sku: '', imageUrl: '', categoryId: '' });
                    setShowProdModal(true);
                }}>+ Thêm Sản phẩm</Button>
            </div>
            <Table responsive hover className="align-middle">
                <thead className="bg-light text-muted small uppercase">
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>SKU/Tên</th>
                        <th>Danh mục</th>
                        <th>Giá</th>
                        <th>Kho hàng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((p, index) => (
                        <tr key={p.id} className={p.isDeleted ? 'table-light opacity-75' : ''}>
                            <td className="text-muted small">{(prodPage - 1) * 10 + index + 1}</td>
                            <td>
                                <div className={`fw-bold ${p.isDeleted ? 'text-decoration-line-through text-danger' : ''}`}>
                                    {p.name} 
                                    {p.isDeleted && <Badge bg="secondary" className="ms-1">Đã xóa</Badge>}
                                </div>
                                <div className="small text-muted">{p.sku}</div>
                            </td>
                            <td><Badge bg="light" text="primary" className="rounded-pill p-1 px-3">{p.categoryName}</Badge></td>
                            <td className={`fw-bold ${p.isDeleted ? 'text-decoration-line-through' : ''}`}>
                                {new Intl.NumberFormat('vi-VN').format(p.price)} VNĐ
                            </td>
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
                                        }}>Sửa</Button>
                                        <Button size="sm" variant="outline-danger" onClick={() => deleteProduct(p.id)}>Xóa</Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline-success" onClick={() => restoreProduct(p.id)}>Khôi phục</Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <PaginationComponent 
                currentPage={prodPage}
                totalPages={prodTotalPages}
                onPageChange={setProdPage}
            />
        </div>
    );
};

export default AdminProductTab;
