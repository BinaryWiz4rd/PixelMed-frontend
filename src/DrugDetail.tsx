import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Button, TextField } from '@mui/material';

interface Drug {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
}

const DrugDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [drug, setDrug] = useState<Drug | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchDrug = async () => {
        if (!id) {
            setError('Drug ID is missing.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('jwtToken');

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

    useEffect(() => {
        fetchDrug();
    }, [id]);

    const handlePurchase = async () => {
        if (!drug) return;

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/');
            return;
        }

        setPurchaseMessage(null);
        setError(null);

        try {
            const response = await fetch('http://localhost:8080/api/drugs/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ drugId: drug.id, quantity: purchaseQuantity }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to purchase drug.');
            }

            const updatedDrug: Drug = await response.json();
            setDrug(updatedDrug);
            setPurchaseMessage(`Successfully purchased ${purchaseQuantity} of ${updatedDrug.name}!`);
            setPurchaseQuantity(1);
        } catch (err: any) {
            console.error('Purchase error:', err);
            setError(err.message || 'An unexpected error occurred during purchase.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ marginLeft: 2 }}>Loading drug details...</Typography>
            </Box>
        );
    }

    if (error && !purchaseMessage) {
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
                <Typography variant="h6">Stock: {drug.stock}</Typography> {/* Display stock */}
                <Typography variant="body1" sx={{ marginTop: 2 }}>Description: {drug.description || 'No description provided.'}</Typography>

                <Box sx={{ marginTop: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <TextField
                        label="Quantity"
                        type="number"
                        variant="outlined"
                        value={purchaseQuantity}
                        onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 1))} // Ensure quantity is at least 1
                        inputProps={{ min: 1, max: drug.stock }} // Set min/max based on stock
                        sx={{ width: '150px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePurchase}
                        disabled={drug.stock === 0 || purchaseQuantity > drug.stock} // Disable if out of stock or quantity exceeds stock
                        sx={{
                            padding: '10px 20px',
                            fontSize: '1rem',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: '#3a6a9b',
                                boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        {drug.stock === 0 ? 'Out of Stock' : 'Buy Drug'}
                    </Button>
                    {purchaseMessage && (
                        <Alert severity="success" sx={{ width: '100%', marginTop: 2 }}>
                            {purchaseMessage}
                        </Alert>
                    )}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', marginTop: 2 }}>
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}
                </Box>
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
