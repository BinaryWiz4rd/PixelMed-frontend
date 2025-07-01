import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Button } from '@mui/material';

interface UserData {
    id: number;
    username: string;
}

const Profile: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:8080/api/users/me', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) { // Unauthorized
                        localStorage.removeItem('jwtToken');
                        navigate('/');
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch profile data.');
                }

                const data: UserData = await response.json();
                setUserData(data);
            } catch (err: any) {
                console.error('Profile fetch error:', err);
                setError(err.message || 'An unexpected error occurred while fetching profile.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ marginLeft: 2 }}>Loading profile...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Alert severity="error">
                    <strong>Error:</strong> {error}
                </Alert>
                <Button onClick={() => navigate('/home')} sx={{ marginTop: 2 }}>Go to Home</Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #E0F7FA, #BBDEFB)',
                color: '#4682B4',
                padding: 4,
            }}
        >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
                My Profile
            </Typography>
            {userData && (
                <Box sx={{ backgroundColor: 'white', padding: 4, borderRadius: '12px', boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <Typography variant="h6">User ID: {userData.id}</Typography>
                    <Typography variant="h6">Username: {userData.username}</Typography>
                </Box>
            )}
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/home')}
                sx={{ marginTop: 4 }}
            >
                Back to Home
            </Button>
        </Box>
    );
};

export default Profile;