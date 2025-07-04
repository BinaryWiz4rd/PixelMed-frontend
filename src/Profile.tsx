import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import useAuth from './hooks/useAuth';
import characterImage from './assets/character.png';

interface UserData {
    id: number;
    username: string;
}

const Profile: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/');
            return;
        }

        const fetchProfile = async () => {
            try {
                const decoded: any = jwtDecode(token);
                const response = await fetch('http://localhost:8080/api/users/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('jwtToken');
                        navigate('/');
                    }
                    throw new Error('Failed to fetch profile data');
                }

                const data = await response.json();
                setUserData(data);
                setNewUsername(data.username);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleUpdateProfile = async () => {
        if (!userData) {
            setError('User data not loaded.');
            return;
        }

        if (newPassword && newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                navigate('/');
                return;
            }

            const updateData: { username?: string; password?: string } = {};
            let changesMade = false;

            if (newUsername && newUsername !== userData.username) {
                updateData.username = newUsername;
                changesMade = true;
            }
            if (newPassword) {
                updateData.password = newPassword;
                changesMade = true;
            }

            if (!changesMade) {
                setEditMode(false);
                setNewPassword('');
                setConfirmPassword('');
                return;
            }

            console.log("Sending update payload:", updateData);

            const response = await fetch(`http://localhost:8080/api/users/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('jwtToken');
                    navigate('/');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Update failed');
            }

            const updatedData = await response.json();
            setUserData(updatedData);
            setNewUsername(updatedData.username);
            setEditMode(false);
            setNewPassword('');
            setConfirmPassword('');
            setSuccess('Profile updated successfully!');
        } catch (err) {
            console.error('Update error:', err);
            setError(err instanceof Error ? err.message : 'Update failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!userData) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                navigate('/');
                return;
            }

            const response = await fetch(`http://localhost:8080/api/users/${userData.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('jwtToken');
                    navigate('/');
                }
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete account');
            }

            setSuccess('Account deleted successfully. You will be logged out.');
            setTimeout(() => {
                logout();
            }, 2000);
        } catch (err) {
            console.error('Delete error:', err);
            setError(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setIsSubmitting(false);
            setOpenDeleteDialog(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#BBDEFB'
            }}>
                <CircularProgress sx={{ color: '#4CAF50' }} />
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(to bottom right, #E0F7FA, #BBDEFB)',
            color: '#4682B4',
            padding: 4,
        }}>
            <Paper elevation={6} sx={{
                backgroundColor: 'white',
                padding: 4,
                borderRadius: '12px',
                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
            }}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 4
                }}>
                    <img
                        src={characterImage}
                        alt="Pixel Character"
                        style={{
                            width: '120px',
                            height: '120px',
                            imageRendering: 'pixelated',
                            border: '4px solid #4682B4',
                            borderRadius: '50%',
                            padding: '8px'
                        }}
                    />
                </Box>

                <Typography variant="h4" sx={{
                    fontWeight: 'bold',
                    marginBottom: 2,
                    color: '#283593',
                    fontFamily: '"Pixelify Sans", sans-serif'
                }}>
                    Your Profile
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ marginBottom: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ marginBottom: 3 }}>
                        {success}
                    </Alert>
                )}

                {!editMode ? (
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ marginBottom: 1, color: '#4682B4' }}>
                            Username: {userData?.username}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 4 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setEditMode(true)}
                                sx={{
                                    padding: '10px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Edit Profile
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setOpenDeleteDialog(true)}
                                sx={{
                                    padding: '10px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Delete Account
                            </Button>
                        </Box>
                        <Button
                            variant="text"
                            color="primary"
                            onClick={() => navigate('/home')}
                            sx={{
                                marginTop: 3,
                                fontSize: '0.9rem'
                            }}
                        >
                            Back to Home
                        </Button>
                    </Box>
                ) : (
                    <Box component="form" sx={{ mt: 3 }}>
                        <TextField
                            fullWidth
                            label="Username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4682B4',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#3a6a9b',
                                    },
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            margin="normal"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4682B4',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#3a6a9b',
                                    },
                                },
                                mt: 2
                            }}
                        />
                        <TextField
                            fullWidth
                            type="password"
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            margin="normal"
                            error={!!newPassword && newPassword !== confirmPassword}
                            helperText={!!newPassword && newPassword !== confirmPassword ? "Passwords don't match" : ''}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: '#4682B4',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: '#3a6a9b',
                                    },
                                },
                                mt: 2
                            }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                            <Button
                                variant="contained"
                                onClick={handleUpdateProfile}
                                disabled={isSubmitting}
                                sx={{
                                    backgroundColor: '#4CAF50',
                                    '&:hover': { backgroundColor: '#3e8e41' },
                                    padding: '10px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={() => {
                                    setEditMode(false);
                                    setNewPassword('');
                                    setConfirmPassword('');
                                    setError(null);
                                }}
                                sx={{
                                    padding: '10px 24px',
                                    fontSize: '1rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                )}

                <Dialog
                    open={openDeleteDialog}
                    onClose={() => setOpenDeleteDialog(false)}
                >
                    <DialogTitle sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                        Confirm Account Deletion
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete your account? This action cannot be undone.
                            All your data will be permanently removed from the system.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setOpenDeleteDialog(false)}
                            sx={{ color: '#4682B4' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            color="error"
                            disabled={isSubmitting}
                            sx={{
                                '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' },
                                fontWeight: 'bold'
                            }}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Box>
    );
};

export default Profile;
