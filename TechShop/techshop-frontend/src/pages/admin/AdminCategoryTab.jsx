import React from 'react';
import { Table, Button } from 'react-bootstrap';
import { RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';

const AdminCategoryTab = ({ 
    categories, 
    setEditingCategory, 
    setCategoryForm, 
    setShowCatModal, 
    deleteCategory,
    loadData
}) => {
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
        setTimeout(() => setRefreshing(false), 800);
    };

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <h5 className="mb-0">Danh mục ({categories.length})</h5>
                    <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={handleRefresh}
                        className={`rounded-circle d-flex align-items-center justify-content-center ${refreshing ? 'spin-animation' : ''}`}
                        style={{ width: '32px', height: '32px' }}
                        title="Làm mới"
                    >
                        <RefreshCw size={14} />
                    </Button>
                </div>
                <Button variant="primary" onClick={() => {
                    setEditingCategory(null);
                    setCategoryForm({ name: '', description: '', imageUrl: '', parentCategoryId: '' });
                    setShowCatModal(true);
                }}>
                    <Plus size={18} className="me-2" />
                    Thêm Danh mục
                </Button>
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
                                <Button size="sm" variant="outline-info" className="me-2 d-inline-flex align-items-center gap-1" onClick={() => {
                                    setEditingCategory(c);
                                    setCategoryForm({ ...c, parentCategoryId: c.parentCategoryId || '' });
                                    setShowCatModal(true);
                                }}>
                                    <Edit size={14} /> Sửa
                                </Button>
                                <Button size="sm" variant="outline-danger" className="d-inline-flex align-items-center gap-1" onClick={() => deleteCategory(c.id)}>
                                    <Trash2 size={14} /> Xóa
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default AdminCategoryTab;
