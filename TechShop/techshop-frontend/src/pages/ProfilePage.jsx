import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Image, Spinner, Badge, Accordion } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService, uploadService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        username: '',
        fullName: '',
        email: '',
        phone: '',
        address: '',
        avatarUrl: ''
    });
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authService.getProfile();
            setProfile(res.data);
        } catch (err) {
            toast.error('Không thể tải thông tin hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const updateData = {
                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                address: profile.address,
                avatarUrl: profile.avatarUrl
            };
            await authService.updateProfile(updateData);
            
            if (profile.avatarUrl) {
                localStorage.setItem('avatarUrl', profile.avatarUrl);
                window.dispatchEvent(new Event('storage'));
            }
            
            toast.success('Cập nhật hồ sơ thành công!');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Cập nhật thất bại. Email có thể đã được sử dụng.';
            toast.error(msg);
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }
        if (passwordData.newPassword.length < 3) {
            toast.error('Mật khẩu mới phải có ít nhất 3 ký tự');
            return;
        }

        setChangingPassword(true);
        try {
            await authService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            setTimeout(() => {
                logout();
                navigate('/login');
            }, 2000);
        } catch (err) {
            const msg = err.response?.data || 'Đổi mật khẩu thất bại';
            toast.error(msg);
        } finally {
            setChangingPassword(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const res = await uploadService.uploadImage(file);
            setProfile({ ...profile, avatarUrl: res.data.url });
            toast.success('Đã tải ảnh lên thành công!');
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data || 'Tải ảnh thất bại';
            toast.error(msg);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải thông tin...</p>
            </Container>
        );
    }

    return (
        <Container className="py-5 animate-fade">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <div className="d-flex align-items-center mb-4 gap-3">
                        <div className="bg-primary p-3 rounded-4 shadow-sm text-white">
                            <i className="bi bi-person-badge fs-4"></i>
                        </div>
                        <div>
                            <h2 className="mb-0 fw-bold">Hồ sơ cá nhân</h2>
                            <p className="text-muted mb-0">Quản lý thông tin tài khoản của bạn</p>
                        </div>
                    </div>

                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="glass-card border-0 text-center p-4 h-100 shadow-sm overflow-hidden position-relative">
                                <div className="position-absolute top-0 start-0 w-100 bg-primary opacity-10" style={{ height: '80px' }}></div>
                                <Card.Body className="pt-5 mt-2">
                                    <div className="position-relative d-inline-block mb-4">
                                        <Image 
                                            src={profile.avatarUrl || defaultAvatar} 
                                            roundedCircle 
                                            width="150" 
                                            height="150" 
                                            className="border-4 border-white shadow-lg profile-avatar-main"
                                            style={{ objectFit: 'cover' }}
                                        />
                                        <label htmlFor="avatar-upload" className="avatar-edit-badge shadow-sm">
                                            {uploading ? <Spinner size="sm" animation="border" /> : <i className="bi bi-camera-fill"></i>}
                                        </label>
                                        <input 
                                            type="file" 
                                            id="avatar-upload" 
                                            className="d-none" 
                                            accept="image/*" 
                                            onChange={handleAvatarUpload}
                                            disabled={uploading}
                                        />
                                    </div>
                                    <h4 className="fw-bold mb-1 text-dark">{profile.fullName || profile.username}</h4>
                                    <p className="text-primary fw-medium small mb-3">@{profile.username}</p>
                                    <Badge bg="light" text="primary" className="rounded-pill px-3 py-2 border shadow-sm small uppercase tracking-wider font-bold">
                                        {user?.role === 'Admin' ? 'Quản trị viên' : 'Thành viên'}
                                    </Badge>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={8}>
                            <Card className="glass-card border-0 p-4 shadow-sm mb-4">
                                <Card.Body>
                                    <Form onSubmit={handleUpdate}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="small fw-bold text-muted uppercase">Tên đăng nhập</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        value={profile.username} 
                                                        disabled 
                                                        className="bg-light border-0 py-2 px-3 fw-bold text-muted"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-4">
                                                    <Form.Label className="small fw-bold text-muted uppercase">Họ và tên</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        placeholder="Nhập họ và tên" 
                                                        value={profile.fullName || ''} 
                                                        onChange={e => setProfile({...profile, fullName: e.target.value})}
                                                        className="border-0 bg-light py-2 px-3 focus-shadow"
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted uppercase">Email liên hệ</Form.Label>
                                            <Form.Control 
                                                type="email" 
                                                placeholder="example@gmail.com" 
                                                value={profile.email || ''} 
                                                onChange={e => setProfile({...profile, email: e.target.value})}
                                                className="border-0 bg-light py-2 px-3 focus-shadow"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted uppercase">Số điện thoại</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                placeholder="Nhập số điện thoại" 
                                                value={profile.phone || ''} 
                                                onChange={e => setProfile({...profile, phone: e.target.value})}
                                                className="border-0 bg-light py-2 px-3 focus-shadow"
                                            />
                                        </Form.Group>

                                        <Form.Group className="mb-4">
                                            <Form.Label className="small fw-bold text-muted uppercase">Địa chỉ giao hàng</Form.Label>
                                            <Form.Control 
                                                as="textarea" 
                                                rows={2} 
                                                placeholder="Nhập địa chỉ của bạn" 
                                                value={profile.address || ''} 
                                                onChange={e => setProfile({...profile, address: e.target.value})}
                                                className="border-0 bg-light py-2 px-3 focus-shadow"
                                            />
                                        </Form.Group>

                                        <div className="d-flex justify-content-end mt-2">
                                            <Button 
                                                variant="primary" 
                                                type="submit" 
                                                disabled={updating}
                                                className="rounded-pill px-5 shadow-sm gradient-primary border-0 py-2"
                                            >
                                                {updating ? <Spinner size="sm" animation="border" /> : 'Lưu thông tin'}
                                            </Button>
                                        </div>
                                    </Form>
                                </Card.Body>
                            </Card>

                            <Accordion>
                                <Accordion.Item eventKey="0" className="border-0 shadow-sm rounded-4 overflow-hidden">
                                    <Accordion.Header className="bg-white">
                                        <div className="d-flex align-items-center gap-2 py-1">
                                            <i className="bi bi-shield-lock-fill text-primary mt-1"></i>
                                            <span className="fw-bold">Đổi mật khẩu</span>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body className="bg-white p-4">
                                        <Form onSubmit={handleChangePassword}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-muted uppercase">Mật khẩu hiện tại</Form.Label>
                                                <Form.Control 
                                                    type="password" 
                                                    required
                                                    value={passwordData.oldPassword}
                                                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                                    className="border-0 bg-light py-2 px-3 focus-shadow"
                                                />
                                            </Form.Group>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="small fw-bold text-muted uppercase">Mật khẩu mới</Form.Label>
                                                        <Form.Control 
                                                            type="password" 
                                                            required
                                                            value={passwordData.newPassword}
                                                            onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                                            className="border-0 bg-light py-2 px-3 focus-shadow"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label className="small fw-bold text-muted uppercase">Xác nhận mật khẩu</Form.Label>
                                                        <Form.Control 
                                                            type="password" 
                                                            required
                                                            value={passwordData.confirmPassword}
                                                            onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                                            className="border-0 bg-light py-2 px-3 focus-shadow"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <div className="d-flex justify-content-end mt-3">
                                                <Button 
                                                    variant="dark" 
                                                    type="submit" 
                                                    disabled={changingPassword}
                                                    className="rounded-pill px-4 shadow-sm border-0 py-2"
                                                >
                                                    {changingPassword ? <Spinner size="sm" animation="border" /> : 'Cập nhật mật khẩu'}
                                                </Button>
                                            </div>
                                        </Form>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <style>{`
                .avatar-edit-badge {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background: #6366f1;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 3px solid white;
                    transition: all 0.3s ease;
                }
                .avatar-edit-badge:hover {
                    background: #4f46e5;
                    transform: scale(1.1);
                }
                .focus-shadow:focus {
                    box-shadow: 0 0 0 0.25rem rgba(99, 102, 241, 0.1);
                    background: #fff !important;
                }
                .profile-avatar-main {
                    transition: all 0.3s ease;
                }
                .gradient-primary {
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                }
                .accordion-button:not(.collapsed) {
                    background-color: #fff;
                    color: inherit;
                    box-shadow: none;
                }
                .accordion-button:focus {
                    box-shadow: none;
                    border-color: rgba(0,0,0,.125);
                }
                .accordion-item {
                    border: none;
                }
            `}</style>
        </Container>
    );
}

export default ProfilePage;
