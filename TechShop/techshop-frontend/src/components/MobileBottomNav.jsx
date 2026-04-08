import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Badge } from 'react-bootstrap';

function MobileBottomNav() {
    const { user } = useAuth();
    const { cartCount } = useCart();
    const location = useLocation();

    // Only visible on mobile/tablets
    if (window.innerWidth >= 992) return null;

    const navItems = [
        { path: '/', label: 'Trang chủ', icon: '🏠' },
        { path: '/cart', label: 'Giỏ hàng', icon: '🛒', protected: true, badge: true },
        { path: '/history', label: 'Đơn hàng', icon: '📦', protected: true },
        { path: '/profile', label: 'Cá nhân', icon: '👤', protected: true },
    ];

    if (user?.role === 'Admin') {
        navItems.splice(3, 0, { path: '/admin', label: 'Quản trị', icon: '⚙️', protected: true });
    }

    return (
        <div className="bottom-nav d-lg-none">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                
                // If protected and no user, link to login
                const targetPath = item.protected && !user ? '/login' : item.path;

                return (
                    <NavLink 
                        key={item.path}
                        to={targetPath}
                        className={({ isActive }) => `bottom-nav-item position-relative ${isActive ? 'active' : ''}`}
                    >
                        <i className={isActive ? 'nav-icon-pop' : ''}>{item.icon}</i>
                        {item.badge && cartCount > 0 && (
                            <Badge pill bg="danger" className="position-absolute translate-middle-y" style={{ fontSize: '0.6rem', top: '5px', left: 'calc(50% + 8px)', border: '2px solid white' }}>
                                {cartCount}
                            </Badge>
                        )}
                        <span>{item.label}</span>
                    </NavLink>
                );
            })}
        </div>
    );
}

export default MobileBottomNav;
