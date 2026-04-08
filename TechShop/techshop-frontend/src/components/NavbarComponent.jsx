import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Image, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function NavbarComponent() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
        <Navbar expand="lg" className="navbar-modern mb-4 sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fs-3 fw-bold mx-auto mx-lg-0">
                    <span className="text-primary">Tech</span>Shop
                </Navbar.Brand>

                {/* Mobile Avatar/Login - Only visible on small screens */}
                <div className="d-lg-none position-absolute end-0 me-3">
                    {user ? (
                        <Link to="/profile">
                            <Image 
                                src={user.avatarUrl || defaultAvatar} 
                                roundedCircle 
                                width="35" 
                                height="35" 
                                className="border shadow-sm"
                                style={{ objectFit: 'cover' }}
                            />
                        </Link>
                    ) : (
                        <Link to="/login" className="text-primary text-decoration-none fw-bold small">Đăng nhập</Link>
                    )}
                </div>
                
                {/* Desktop Menu */}
                <Navbar.Toggle aria-controls="basic-navbar-nav" className="d-none d-lg-block border-0 shadow-none" />
                <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
                    <Nav className="ms-auto align-items-lg-center">
                        <Nav.Link as={Link} to="/" className="text-center text-lg-start">Trang chủ</Nav.Link>
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/cart" className="text-center text-lg-start position-relative">
                                    Giỏ hàng
                                    {cartCount > 0 && (
                                        <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle" style={{ fontSize: '0.65rem' }}>
                                            {cartCount}
                                        </Badge>
                                    )}
                                </Nav.Link>
                                <Nav.Link as={Link} to="/history" className="text-center text-lg-start">Đơn hàng</Nav.Link>
                                {user.role === 'Admin' && (
                                    <Nav.Link as={Link} to="/admin" className="text-warning fw-bold text-center text-lg-start">Quản trị</Nav.Link>
                                )}
                                <div className="d-flex justify-content-center d-lg-block mt-3 mt-lg-0">
                                    <NavDropdown 
                                        title={
                                            <div className="d-inline-flex align-items-center">
                                                <Image 
                                                    src={user.avatarUrl || defaultAvatar} 
                                                    roundedCircle 
                                                    width="32" 
                                                    height="32" 
                                                    className="me-2 border shadow-sm"
                                                    style={{ objectFit: 'cover' }}
                                                />
                                                <span className="small fw-bold text-dark">{user.username}</span>
                                            </div>
                                        } 
                                        id="user-nav-dropdown"
                                        className="ms-lg-3 custom-dropdown text-center"
                                        align="end"
                                    >
                                        <NavDropdown.Item as={Link} to="/profile" className="text-center text-lg-start">Hồ sơ cá nhân</NavDropdown.Item>
                                        <NavDropdown.Divider />
                                        <NavDropdown.Item onClick={handleLogout} className="text-danger text-center text-lg-start">
                                            Đăng xuất
                                        </NavDropdown.Item>
                                    </NavDropdown>
                                </div>
                            </>
                        ) : (
                            <div className="ms-lg-3 d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0">
                                <Button as={Link} to="/login" variant="light" className="rounded-pill px-4 w-100 w-lg-auto">Đăng nhập</Button>
                                <Button as={Link} to="/register" variant="primary" className="rounded-pill px-4 shadow-sm w-100 w-lg-auto">Đăng ký</Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
