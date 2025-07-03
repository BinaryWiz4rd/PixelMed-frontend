import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    CircularProgress,
    Alert,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider
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

const DrugList: React.FC = () => {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
            navigate('/');
        }

        const fetchAllDrugs = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/drugs/all', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        localStorage.removeItem('jwtToken');
                        navigate('/');
                    }
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch drug list.');
                }

                const data: Drug[] = await response.json();
                setDrugs(data);
            } catch (err: any) {
                console.error('Drug list fetch error:', err);
                setError(err.message || 'An unexpected error occurred while fetching drugs.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllDrugs();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ marginLeft: 2 }}>Loading drugs...</Typography>
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
                padding: 4,
            }}
        >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', marginBottom: 4 }}>
                {userRole === 'ROLE_ADMIN' ? 'Drug Inventory' : 'Available Drugs'}
            </Typography>

            <Paper sx={{ width: '100%', maxWidth: 800, overflow: 'hidden' }}>
                <List>
                    {drugs.map((drug, index) => (
                        <React.Fragment key={drug.id}>
                            <ListItem
                                sx={{
                                    '&:hover': {
                                        backgroundColor: userRole === 'ROLE_ADMIN' ? 'inherit' : 'action.hover',
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {drug.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography component="span" display="block">
                                                Price: ${drug.price.toFixed(2)}
                                            </Typography>
                                            <Typography component="span" display="block">
                                                Stock: {drug.stock}
                                            </Typography>
                                            {drug.description && (
                                                <Typography component="span" display="block">
                                                    Description: {drug.description}
                                                </Typography>
                                            )}
                                        </>
                                    }
                                />
                                {userRole !== 'ROLE_ADMIN' && (
                                    <Button
                                        variant="contained"
                                        onClick={() => navigate(`/drugs/${drug.id}`)}
                                    >
                                        View & Purchase
                                    </Button>
                                )}
                            </ListItem>
                            {index < drugs.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            <Button
                variant="contained"
                onClick={() => navigate('/home')}
                sx={{ mt: 4 }}
            >
                Back to Home
            </Button>
        </Box>
    );
};

export default DrugList;
