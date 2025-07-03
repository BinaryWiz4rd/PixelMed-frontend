import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    CircularProgress,
    Alert,
    Button,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
    Grid,
} from '@mui/material';
import { styled } from '@mui/system';

interface Drug {
    id: number;
    name: string;
    price: number;
    description: string;
    stock: number;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        transform: 'translateX(5px)',
    },
    padding: theme.spacing(2),
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
}));

const DrugList: React.FC = () => {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAllDrugs = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                navigate('/');
                return;
            }

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
                    throw new Error(errorData.message || 'failed to fetch drug list.');
                }

                const data: Drug[] = await response.json();
                setDrugs(data);
            } catch (err: any) {
                console.error('drug list fetch error:', err);
                setError(err.message || 'an unexpected error occurred while fetching drugs.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllDrugs();
    }, [navigate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom right, #E0F7FA, #BBDEFB)' }}>
                <CircularProgress sx={{ color: '#4682B4' }} />
                <Typography sx={{ marginLeft: 2, color: '#4682B4', marginTop: 2 }}>Loading drugs...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(to bottom right, #E0F7FA, #BBDEFB)' }}>
                <Alert severity="error" sx={{ marginBottom: 2 }}>
                    <strong>Error:</strong> {error}
                </Alert>
                <Button variant="contained" color="primary" onClick={() => navigate('/home')}>Go to Home</Button>
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
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', marginBottom: 4, color: '#283593' }}>
                Available Drugs
            </Typography>
            {drugs.length === 0 ? (
                <Paper elevation={3} sx={{ padding: 4, borderRadius: '12px', textAlign: 'center', maxWidth: 600, width: '100%', backgroundColor: 'white' }}>
                    <Typography variant="h6" color="text.secondary">No drugs found. Please add some drugs to the system.</Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/home')}
                        sx={{ marginTop: 3 }}
                    >
                        Back to Home
                    </Button>
                </Paper>
            ) : (
                <Paper elevation={6} sx={{
                    width: '100%',
                    maxWidth: 700,
                    bgcolor: 'background.paper',
                    borderRadius: '16px',
                    boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.18)',
                    padding: 3,
                    maxHeight: '70vh',
                    overflowY: 'auto',
                }}>
                    <List>
                        {drugs.map((drug, index) => (
                            <React.Fragment key={drug.id}>
                                <StyledListItem onClick={() => navigate(`/drugs/${drug.id}`)}>
                                    <ListItemText
                                        primary={
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#3F51B5' }}>
                                                {drug.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="body1" color="text.secondary">
                                                Price: \$${drug.price.toFixed(2)} | Stock: {drug.stock}
                                            </Typography>
                                        }
                                    />
                                </StyledListItem>
                                {index < drugs.length - 1 && <Divider component="li" sx={{ marginY: 1 }} />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/home')}
                sx={{
                    marginTop: 4,
                    padding: '12px 30px',
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                        backgroundColor: '#3a6a9b',
                        boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                    },
                }}
            >
                Back to Home
            </Button>
        </Box>
    );
};

export default DrugList;
