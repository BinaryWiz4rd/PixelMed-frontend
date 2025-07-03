import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    CircularProgress,
    Alert,
    Button,
    TextField
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

interface Drug {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
}

interface DecodedToken {
    role: string;
    sub: string;
    exp: number;
    iat: number;
}

const DrugDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [drug, setDrug] = useState<Drug | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
    const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string>('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const decoded: DecodedToken = jwtDecode(token);
            setUserRole(decoded.role);
        } catch (e) {
            console.error('Error decoding token:', e);
        }

        const fetchDrug = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/drugs/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
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
    }, [id, navigate]);

    const handlePurchase = async () => {
        if (!drug || purchaseQuantity <= 0 || purchaseQuantity > drug.stock) return;

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/');
            return;
        }

        setError(null);
        setPurchaseMessage(null);

        try {
            const response = await fetch('http://localhost:8080/api/drugs/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    drugId: drug.id,
                    quantity: purchaseQuantity
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to complete purchase.');
            }

            const updatedDrug: Drug = await response.json();
            setDrug(updatedDrug);
            setPurchaseMessage(`Successfully purchased ${purchaseQuantity} units of ${drug.name}!`);
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

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Alert severity="error">
                    <strong>Error:</strong> {error}
                </Alert>
                <Button onClick={() => navigate('/drugs')} sx={{ marginTop: 2 }}>
                    Back to Drug List
                </Button>
            </Box>
        );
    }

    if (!drug) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <Alert severity="info">Drug not found.</Alert>
                <Button onClick={() => navigate('/drugs')} sx={{ marginTop: 2 }}>
                    Back to Drug List
                </Button>
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
                padding: 4,
            }}
        >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', marginBottom: 4 }}>
                Drug Details
            </Typography>

            <Box sx={{
                backgroundColor: 'background.paper',
                padding: 4,
                borderRadius: 2,
                boxShadow: 3,
                maxWidth: 600,
                width: '100%',
                textAlign: 'center'
            }}>
                <Typography variant="h6" gutterBottom>ID: {drug.id}</Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {drug.name}
                </Typography>
                <Typography variant="h6" gutterBottom>
                    Price: ${drug.price.toFixed(2)}
                </Typography>
                <Typography variant="h6" gutterBottom color={drug.stock > 0 ? 'success.main' : 'error'}>
                    Stock: {drug.stock}
                </Typography>
                {drug.description && (
                    <Typography variant="body1" gutterBottom>
                        Description: {drug.description}
                    </Typography>
                )}

                {userRole === 'ROLE_ADMIN' ? (
                    <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>
                        (Admin view only - purchasing disabled)
                    </Typography>
                ) : (
                    <>
                        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                label="Quantity"
                                type="number"
                                variant="outlined"
                                value={purchaseQuantity}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                        setPurchaseQuantity(Math.min(value, drug.stock));
                                    }
                                }}
                                inputProps={{
                                    min: 1,
                                    max: drug.stock
                                }}
                                sx={{ maxWidth: 200, mx: 'auto' }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handlePurchase}
                                disabled={drug.stock <= 0 || purchaseQuantity <= 0 || purchaseQuantity > drug.stock}
                                sx={{ maxWidth: 200, mx: 'auto' }}
                            >
                                {drug.stock <= 0 ? 'Out of Stock' : 'Purchase'}
                            </Button>
                            {purchaseMessage && (
                                <Alert severity="success" sx={{ mt: 2 }}>
                                    {purchaseMessage}
                                </Alert>
                            )}
                        </Box>
                    </>
                )}
            </Box>

            <Button
                variant="contained"
                onClick={() => navigate('/drugs')}
                sx={{ mt: 4 }}
            >
                Back to Drug List
            </Button>
        </Box>
    );
};

export default DrugDetail;
