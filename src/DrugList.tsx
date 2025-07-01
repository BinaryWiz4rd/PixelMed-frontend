import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Alert, Button, List, ListItem, ListItemText, Divider } from '@mui/material';

interface Drug {
    id: number;
    name: string;
    price: number;
    description: string;
}

const DrugList: React.FC = () => {
    const [drugs, setDrugs] = useState<Drug[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    //na razie hardcoded, potem integracja z backeeend
    const hardcodedDrugIds = [1, 2, 3];

    useEffect(() => {
        const fetchDrugs = async () => {
            const token = localStorage.getItem('jwtToken');
            if (!token) {
                navigate('/');
                return;
            }

            const fetchedDrugs: Drug[] = [];
            let hasError = false;

            for (const id of hardcodedDrugIds) {
                try {
                    const response = await fetch(`http://localhost:8080/api/drugs/${id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token && { 'Authorization': `Bearer ${token}` }),
                        },
                    });

                    if (!response.ok) {
                        console.warn(`Drug with ID ${id} not found or error fetching.`);
                        continue; // Skip to the next ID
                    }

                    const data: Drug = await response.json();
                    fetchedDrugs.push(data);
                } catch (err: any) {
                    console.error(`Error fetching drug ID ${id}:`, err);
                    setError(`An error occurred while fetching drug ID ${id}: ${err.message}`);
                    hasError = true;
                    break;
                }
            }

            if (!hasError) {
                setDrugs(fetchedDrugs);
            }
            setLoading(false);
        };

        fetchDrugs();
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
                background: 'linear-gradient(to bottom right, #E0F7FA, #BBDEFB)',
                color: '#4682B4',
                padding: 4,
            }}
        >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', marginBottom: 3 }}>
                Available Drugs (Simulated List)
            </Typography>
            {drugs.length === 0 ? (
                <Typography>No drugs found for the hardcoded IDs. Please check your `hardcodedDrugIds` in `DrugList.tsx`.</Typography>
            ) : (
                <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper', borderRadius: '12px', boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)' }}>
                    {drugs.map((drug) => (
                        <React.Fragment key={drug.id}>
                            <ListItem component="div" onClick={() => navigate(`/drugs/${drug.id}`)}>
                                <ListItemText
                                    primary={drug.name}
                                    secondary={`Price: $${drug.price.toFixed(2)}`}
                                />
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))}
                </List>
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

export default DrugList;
