import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Button } from '@mui/material';

interface Drug {
    id: number;
    name: string;
    price: number;
    description: string;
}

const DrugDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [drug, setDrug] = useState<Drug | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDrug = async () => {
            if (!id) {
                setError('Drug ID is missing.');
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('jwtToken');
            //na razie permit all jest w backendzie, wiec to trzeba bedzie zmienic

            try {
                const response = await fetch(`http://localhost:8080/api/drugs/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch drug details.');
                }

                const data: Drug = await response.json();
                setDrug(data);
            } catch (err: any) {
                console.error('Drug detail fetch error:', err);
                setError(err.message || 'An unexpected error occurred while fetching drug details.');
            } finally {
                setLoading(false);
            }
        };

        fetchDrug();
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ marginLeft: 2 }}>Loading drug details...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Alert severity="error">
                    <strong>Error:</strong> {error}
                </Alert>
                <Button onClick={() => navigate('/drugs')} sx={{ marginTop: 2 }}>Back to Drug List</Button>
            </Box>
        );
    }

    if (!drug) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Alert severity="info">Drug not found.</Alert>
                <Button onClick={() => navigate('/drugs')} sx={{ marginTop: 2 }}>Back to Drug List</Button>
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
                Drug Details
            </Typography>
            <Box sx={{ backgroundColor: 'white', padding: 4, borderRadius: '12px', boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
                <Typography variant="h6">ID: {drug.id}</Typography>
                <Typography variant="h6">Name: {drug.name}</Typography>
                <Typography variant="h6">Price: \$${drug.price.toFixed(2)}</Typography>
                <Typography variant="body1" sx={{ marginTop: 2 }}>Description: {drug.description || 'No description provided.'}</Typography>
            </Box>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/drugs')}
                sx={{ marginTop: 4 }}
            >
                Back to Drug List
            </Button>
        </Box>
    );
};

export default DrugDetail;