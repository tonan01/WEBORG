import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { Container, Spinner } from 'react-bootstrap';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Nếu đang trong quá trình khôi phục phiên đăng nhập (F5 trang)
    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang xác thực phiên đăng nhập...</p>
            </Container>
        );
    }

    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Nếu yêu cầu quyền Admin mà user không phải Admin
    if (requiredRole === 'Admin' && user.role !== 'Admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
