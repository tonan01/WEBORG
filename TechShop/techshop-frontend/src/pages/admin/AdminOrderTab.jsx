import React from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import PaginationComponent from '../../components/PaginationComponent';

const AdminOrderTab = ({ 
    orders, 
    orderPage, 
    setOrderPage, 
    orderTotalPages, 
    loadData, 
    handleUpdateOrderStatus, 
    setSelectedOrder, 
    setShowOrderModal 
}) => {
    return (
        <div className="p-4">
            <div className="d-flex justify-content-between mb-4">
                <h5>Tất cả đơn hàng ({orders.length})</h5>
                <Button variant="outline-secondary" onClick={loadData}>Làm mới</Button>
            </div>
            <Table responsive hover className="align-middle">
                <thead className="bg-light text-muted small uppercase">
                    <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Tổng cộng</th>
                        <th>Cập nhật trạng thái</th>
                        <th>Chi tiết</th>
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
                            <td className="fw-bold text-primary">{new Intl.NumberFormat('vi-VN').format(o.totalAmount)} VNĐ</td>
                            <td style={{ width: '180px' }}>
                                <Form.Select 
                                    size="sm" 
                                    className="bg-light rounded-pill px-3 border-0"
                                    value={o.status}
                                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                >
                                    <option value="Pending">Chờ xử lý</option>
                                    <option value="Shipped">Đang giao</option>
                                    <option value="Delivered">Đã giao</option>
                                    <option value="Cancelled">Đã hủy</option>
                                </Form.Select>
                            </td>
                            <td>
                                <Button size="sm" variant="outline-dark" onClick={() => {
                                    setSelectedOrder(o);
                                    setShowOrderModal(true);
                                }}>Xem chi tiết</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <PaginationComponent 
                currentPage={orderPage}
                totalPages={orderTotalPages}
                onPageChange={setOrderPage}
            />
        </div>
    );
};

export default AdminOrderTab;
