import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './Home';
import Profile from './Profile';
import DrugList from './DrugList';
import DrugDetail from './DrugDetail';
import CreateDrugForm from './CreateDrugForm';
import './App.css';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AccountCircle, Lock } from '@mui/icons-material';
import '@fontsource/pixelify-sans';
import useAuth from './hooks/useAuth';

const theme = createTheme({
    palette: {
        primary: {
            main: '#87CEEB',
        },
        secondary: {
            main: '#ADD8E6',
        },
        success: {
            main: '#90EE90',
        },
        error: {
            main: '#FFB6C1',
        },
    },
    typography: {
        fontFamily: '"Pixelify Sans", cursive, sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '1.1rem',
                    transition: 'background-color 0.3s ease',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                    },
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                },
            },
        },
    },
});

const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = useAuth(); // Use the custom hook

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            //cos tu dac
            return;
        }
        await login(username, password);
    };

    return (
        <Box
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #E0F7FA, #BBDEFB)',
            }}
        >
            <Box
                sx={{
                    backgroundColor: 'white',
                    padding: { xs: 4, sm: 5 },
                    borderRadius: '12px',
                    boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxWidth: '400px',
                    width: '100%',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'scale(1.02)',
                    },
                }}
            >
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                        fontWeight: 'bold',
                        color: 'text.primary',
                        marginBottom: 3,
                    }}
                >
                    Welcome to PixelMed Pharmacy!
                </Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Username"
                        variant="outlined"
                        fullWidth
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        aria-label="Username"
                        InputProps={{
                            startAdornment: (
                                <AccountCircle sx={{ color: '#87CEEB', marginRight: 1 }} />
                            ),
                        }}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-label="Password"
                        InputProps={{
                            startAdornment: (
                                <Lock sx={{ color: '#87CEEB', marginRight: 1 }} />
                            ),
                        }}
                    />
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', marginTop: 2 }}>
                            <strong>Error:</strong> {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={isLoading}
                        sx={{
                            marginTop: 2,
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: '#3a6a9b',
                                boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                    >
                        {isLoading ? 'logging in...' : 'login'}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

function App() {
    return (
        <Router>
            <ThemeProvider theme={theme}>
                <>
                    <Routes>
                        <Route path="/" element={<LoginForm />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/drugs" element={<DrugList />} />
                        <Route path="/drugs/:id" element={<DrugDetail />} />
                        <Route path="/drugs/create" element={<CreateDrugForm />} />
                    </Routes>
                </>
            </ThemeProvider>
        </Router>
    );
}

export default App;
