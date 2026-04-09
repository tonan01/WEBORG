import React from 'react';
import { Table, Button, Form, Badge } from 'react-bootstrap';
import PaginationComponent from '../../components/PaginationComponent';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminOrderTab = ({ 
    orders, 
    orderPage, 
    setOrderPage, 
    orderTotalPages, 
    orderStatus,
    setOrderStatus,
    loadData, 
    handleUpdateOrderStatus, 
    setSelectedOrder, 
    setShowOrderModal 
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
                    <h5 className="mb-0">Đơn hàng ({orders.length})</h5>
                    <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={handleRefresh}
                        className={`rounded-circle d-flex align-items-center justify-content-center ${refreshing ? 'spin-animation' : ''}`}
                        style={{ width: '32px', height: '32px' }}
                        title="Làm mới"
                    >
                        ↻
                    </Button>
                    <Form.Select 
                        size="sm" 
                        style={{ width: '200px' }}
                        value={orderStatus}
                        onChange={(e) => {
                            setOrderStatus(e.target.value);
                            setOrderPage(1);
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Pending">Chờ xử lý</option>
                        <option value="Shipped">Đang giao</option>
                        <option value="Delivered">Đã giao</option>
                        <option value="Cancelled">Đã hủy</option>
                    </Form.Select>
                </div>
            </div>
            <Table responsive hover className="align-middle">
                <thead className="bg-light text-muted small uppercase">
                    <tr>
                        <th style={{ width: '50px' }}>#</th>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Tổng cộng</th>
                        <th>Cập nhật trạng thái</th>
                        <th>Chi tiết</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((o, index) => (
                        <tr key={o.id}>
                            <td className="text-muted small">{(orderPage - 1) * 10 + index + 1}</td>
                            <td className="fw-bold text-muted">#ORD-{o.id}</td>
                            <td className="small">{formatDate(o.orderDate)}</td>
                            <td>
                                <Badge bg={
                                    o.status === 'Pending' ? 'warning' : 
                                    o.status === 'Shipped' ? 'info' : 
                                    o.status === 'Delivered' ? 'success' : 'danger'
                                } className="rounded-pill px-3">
                                    {o.status}
                                </Badge>
                            </td>
                            <td className="fw-bold text-primary">{formatCurrency(o.totalAmount)}</td>
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
