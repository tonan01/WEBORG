import React from 'react';
import { Table, Button } from 'react-bootstrap';

const AdminCategoryTab = ({ 
    categories, 
    setEditingCategory, 
    setCategoryForm, 
    setShowCatModal, 
    deleteCategory 
}) => {
    return (
        <div className="p-4">
            <div className="d-flex justify-content-between mb-4">
                <h5>Danh mục ({categories.length})</h5>
                <Button variant="primary" onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', imageUrl: '', parentCategoryId: '' });
                    setShowCatModal(true);
                }}>+ Thêm Danh mục</Button>
            </div>
            <Table responsive hover className="align-middle">
                <thead>
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th style={{ width: '60px' }}>Ảnh</th>
                        <th>Tên</th>
                        <th>Danh mục cha</th>
                        <th>Mô tả</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map((c, index) => (
                        <tr key={c.id}>
                            <td className="text-muted small">{index + 1}</td>
                            <td>
                                <img 
                                    src={c.imageUrl || 'https://placehold.co/50?text=No'} 
                                    alt={c.name} 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                    className="border shadow-sm"
                                    onError={(e) => { e.target.src = 'https://placehold.co/50?text=No'; }}
                                />
                            </td>
                            <td className="fw-bold">{c.name}</td>
                            <td>{c.parentCategoryName || <span className="text-muted small">Gốc (Root)</span>}</td>
                            <td className="small text-muted">{c.description || '-'}</td>
                            <td>
                                <Button size="sm" variant="outline-info" className="me-2" onClick={() => {
                                    setEditingCategory(c);
                                    setCategoryForm({ ...c, parentCategoryId: c.parentCategoryId || '' });
                                    setShowCatModal(true);
                                }}>Sửa</Button>
                                <Button size="sm" variant="outline-danger" onClick={() => deleteCategory(c.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default AdminCategoryTab;
