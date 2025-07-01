import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box } from '@mui/material';
import useAuth from './hooks/useAuth';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            console.log('no token found, redirecting to login');
            navigate('/');
        } else {
            console.log('token found:', token);
        }
    }, [navigate]);

    const handleLogout = () => {
        logout();
    };

    return (
        <Box
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                background: 'linear-gradient(to bottom right, #E0F7FA, #BBDEFB)',
                color: '#4682B4',
                padding: 4,
            }}
        >
            <Typography
                variant="h3"
                component="h1"
                sx={{
                    fontWeight: 'bold',
                    marginBottom: 2,
                    animation: 'fadeIn 1s ease-out forwards',
                    '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(-20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                    },
                }}
            >
                Welcome to PixelMed Pharmacy!
            </Typography>
            <Typography variant="h6" sx={{ marginBottom: 3 }}>
                explore our delightful selection of medications and health products!
            </Typography>
            <Box sx={{ marginTop: 3, display: 'flex', gap: 2 }}>
                <Button
                    onClick={() => navigate('/profile')}
                    variant="contained"
                    color="secondary"
                    sx={{
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                        },
                    }}
                >
                    My Profile
                </Button>
                <Button
                    onClick={() => navigate('/drugs')}
                    variant="contained"
                    color="success"
                    sx={{
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                        },
                    }}
                >
                    View Drugs
                </Button>
                <Button
                    onClick={handleLogout}
                    variant="contained"
                    color="primary"
                    sx={{
                        padding: '12px 24px',
                        fontSize: '1.1rem',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                        '&:hover': {
                            backgroundColor: '#3a6a9b',
                            boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                        },
                    }}
                >
                    Logout
                </Button>
            </Box>
        </Box>
    );
};

export default Home;
