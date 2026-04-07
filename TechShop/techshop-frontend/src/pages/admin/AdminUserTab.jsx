import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Form } from 'react-bootstrap';
import { userService } from '../../services/api';
import { toast } from 'react-hot-toast';
import PaginationComponent from '../../components/PaginationComponent';

function AdminUserTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [lockFilter, setLockFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const res = await userService.getAll(roleFilter, lockFilter, page, 10);
            setUsers(res.data.items);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Không thể tải danh sách người dùng';
            toast.error(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [roleFilter, lockFilter, page]);

    const handleToggleLock = async (id) => {
        try {
            await userService.toggleLock(id);
            toast.success('Cập nhật trạng thái thành công');
            loadUsers();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Thao tác thất bại';
            toast.error(msg);
        }
    };

    const handleRoleChange = async (id, newRole) => {
        try {
            await userService.updateRole(id, newRole);
            toast.success('Cập nhật quyền thành công');
            loadUsers();
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Thao tác thất bại';
            toast.error(msg);
        }
    };

    if (loading) return <div className="text-center py-5">Đang tải...</div>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-3">
                    <h4 className="mb-0">Quản lý người dùng</h4>
                    <Form.Select 
                        size="sm" 
                        style={{ width: '150px' }}
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Mọi vai trò</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                    </Form.Select>
                    <Form.Select 
                        size="sm" 
                        style={{ width: '150px' }}
                        value={lockFilter}
                        onChange={(e) => {
                            setLockFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Mọi trạng thái</option>
                        <option value="false">Hoạt động</option>
                        <option value="true">Bị khóa</option>
                    </Form.Select>
                </div>
                <Button variant="outline-primary" size="sm" onClick={loadUsers}>Làm mới</Button>
            </div>

            <div className="table-responsive">
                <Table hover className="align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th className="text-end">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user.id}>
                                <td className="text-muted small">{(page - 1) * 10 + index + 1}</td>
                               <td>
                                    <div className="fw-bold">{user.username}</div>
                                    <small className="text-muted">{user.fullName}</small>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <Form.Select 
                                        size="sm" 
                                        value={user.role} 
                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                        style={{ width: '120px' }}
                                    >
                                        <option value="User">User</option>
                                        <option value="Admin">Admin</option>
                                    </Form.Select>
                                </td>
                                <td>
                                    {user.isLocked ? (
                                        <Badge bg="danger">Bị khóa</Badge>
                                    ) : (
                                        <Badge bg="success">Hoạt động</Badge>
                                    )}
                                </td>
                                <td>{new Date(user.createdDate).toLocaleDateString('vi-VN')}</td>
                                <td className="text-end">
                                    <Button 
                                        variant={user.isLocked ? "success" : "warning"} 
                                        size="sm"
                                        onClick={() => handleToggleLock(user.id)}
                                    >
                                        {user.isLocked ? 'Mở khóa' : 'Khóa'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            <PaginationComponent 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />
        </div>
    );
}

export default AdminUserTab;
