import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function NavbarComponent() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    return (
        <Navbar expand="lg" className="navbar-modern mb-4 sticky-top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fs-3">
                    <span className="text-primary">Tech</span>Shop
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/cart">Giỏ hàng</Nav.Link>
                                <Nav.Link as={Link} to="/history">Đơn hàng</Nav.Link>
                                {user.role === 'Admin' && (
                                    <Nav.Link as={Link} to="/admin" className="text-warning fw-bold">Quản trị</Nav.Link>
                                )}
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
                                    className="ms-lg-3 custom-dropdown"
                                    align="end"
                                >
                                    <NavDropdown.Item as={Link} to="/profile">Hồ sơ cá nhân</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout} className="text-danger">
                                        Đăng xuất
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <div className="ms-lg-3">
                                <Button as={Link} to="/login" variant="light" className="me-2 rounded-pill px-4">Đăng nhập</Button>
                                <Button as={Link} to="/register" variant="primary" className="rounded-pill px-4 shadow-sm">Đăng ký</Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
