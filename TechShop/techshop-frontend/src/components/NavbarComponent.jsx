import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function NavbarComponent() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar expand="lg" className="navbar-modern mb-4">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fs-3">
                    <span className="text-primary">Tech</span>Shop
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto align-items-center">
                        <Nav.Link as={Link} to="/">Home</Nav.Link>
                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
                                <Nav.Link as={Link} to="/history">Orders</Nav.Link>
                                {user.role === 'Admin' && (
                                    <Nav.Link as={Link} to="/admin" className="text-warning fw-bold">Admin Panel</Nav.Link>
                                )}
                                <div className="ms-lg-3 d-flex align-items-center">
                                    <span className="me-3 small text-muted">Hi, <b>{user.username}</b></span>
                                    <Button variant="outline-danger" size="sm" onClick={handleLogout} className="rounded-pill px-3">
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="ms-lg-3">
                                <Button as={Link} to="/login" variant="light" className="me-2 rounded-pill px-4">Login</Button>
                                <Button as={Link} to="/register" variant="primary" className="rounded-pill px-4 shadow-sm">Register</Button>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarComponent;
