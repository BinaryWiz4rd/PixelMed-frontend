import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, TextField, Button, Alert, CircularProgress, Paper } from '@mui/material';

const CreateDrugForm: React.FC = () => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleCreateDrug = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        if (!name || price === '' || stock === '') {
            setError('please fill in all required fields (Name, Price, Stock).');
            setLoading(false);
            return;
        }
        if (typeof price !== 'number' || price < 0) {
            setError('price must be a non-negative number.');
            setLoading(false);
            return;
        }
        if (typeof stock !== 'number' || stock < 0) {
            setError('stock must be a non-negative integer.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/drugs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ name, price, description, stock }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'failed to create drug.');
            }

            const newDrug = await response.json();
            setSuccessMessage(`Drug "${newDrug.name}" created successfully with ID: ${newDrug.id}`);
            setName('');
            setPrice('');
            setDescription('');
            setStock('');
        } catch (err: any) {
            console.error('Create drug error:', err);
            setError(err.message || 'An unexpected error occurred during drug creation.');
        } finally {
            setLoading(false);
        }
    };

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
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', marginBottom: 3, color: '#283593' }}>
                Create New Drug
            </Typography>
            <Paper elevation={6} sx={{
                backgroundColor: 'white',
                padding: 4,
                borderRadius: '12px',
                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
            }}>
                <Box component="form" onSubmit={handleCreateDrug} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Drug Name"
                        variant="outlined"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        inputProps={{ minLength: 3, maxLength: 50 }}
                    />
                    <TextField
                        label="Price"
                        type="number"
                        variant="outlined"
                        fullWidth
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || '')}
                        required
                        inputProps={{ min: 0, step: "0.01" }}
                    />
                    <TextField
                        label="Description (Optional)"
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <TextField
                        label="Stock"
                        type="number"
                        variant="outlined"
                        fullWidth
                        value={stock}
                        onChange={(e) => setStock(parseInt(e.target.value) || '')}
                        required
                        inputProps={{ min: 0 }}
                    />
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', marginTop: 2 }}>
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}
                    {successMessage && (
                        <Alert severity="success" sx={{ width: '100%', marginTop: 2 }}>
                            {successMessage}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{
                            marginTop: 2,
                            padding: '12px 24px',
                            fontSize: '1.1rem',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: '#3a6a9b',
                                boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Drug'}
                    </Button>
                </Box>
            </Paper>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/home')}
                sx={{ marginTop: 4 }}
            >
                Back to Home
            </Button>
        </Box>
    );
};

export default CreateDrugForm;
