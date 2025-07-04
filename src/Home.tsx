import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import useAuth from './hooks/useAuth';
import { jwtDecode } from 'jwt-decode';
import backgroundMapImage from './assets/map.jpg';
import characterImage from './assets/character.png';
import pharmacyImage from './assets/pharmacy.png';
import profileImage from './assets/profile.png';
import logoutImage from './assets/logout.png';
import adminHQImage from './assets/admin-hq.png';

interface DecodedToken {
    role: string;
    sub: string; //username
    exp: number; //expiration time
    iat: number; //issued at
}

const IMAGE_PATHS = {
    backgroundMap: backgroundMapImage,
    character: characterImage,
    pharmacy: pharmacyImage,
    profile: profileImage,
    logout: logoutImage,
    adminHQ: adminHQImage,
};

const PIXEL_SCALE = 2;
const STEP = 16 * PIXEL_SCALE;

const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;

const PixelCharacter: React.FC<{ position: { x: number; y: number }; imageSrc: string }> = ({ position, imageSrc }) => (
    <Box
        sx={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${48 * PIXEL_SCALE}px`,
            height: `${48 * PIXEL_SCALE}px`,
            zIndex: 10,
            transition: 'left 0.1s linear, top 0.1s linear',
            transform: 'translate(-50%, -50%)',
            imageRendering: 'pixelated',
            pointerEvents: 'none',
        }}
    >
        <img src={imageSrc} alt="Pixel Character" style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} />
    </Box>
);

const PixelInteractiveArea: React.FC<{
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    imageSrc: string;
    label: string;
    onClick: () => void;
}> = ({ position, dimensions, imageSrc, label, onClick }) => (
    <Box
        sx={{
            position: 'absolute',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            cursor: 'pointer',
            backgroundColor: 'transparent',
            transition: 'transform 0.2s ease',
            '&:hover': {
                transform: 'scale(1.05)',
            },
        }}
        onClick={onClick}
        aria-label={label}
    >
        <img
            src={imageSrc}
            alt={label}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                imageRendering: 'pixelated',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
            }}
        />
        <Typography
            variant="caption"
            sx={{
                position: 'absolute',
                bottom: '-25px',
                color: '#E0F7FA',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                whiteSpace: 'nowrap',
                fontSize: '12px',
                padding: '4px 8px',
                backgroundColor: 'rgba(0, 31, 63, 0.8)',
                borderRadius: '6px',
                border: '1px solid rgba(224, 247, 250, 0.3)',
                backdropFilter: 'blur(2px)',
            }}
        >
            {label}
        </Typography>
    </Box>
);

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loadingRole, setLoadingRole] = useState(true);

    const [charPos, setCharPos] = useState({
        x: 400,
        y: 450
    });

    const interactionAreas = useMemo(() => ({
        profile: { position: { x: 650, y: 120 }, dimensions: { width: 60, height: 70 }, path: '/profile', image: IMAGE_PATHS.profile },
        pharmacy: { position: { x: 150, y: 350 }, dimensions: { width: 90, height: 85 }, path: '/drugs', image: IMAGE_PATHS.pharmacy },
        logout: { position: { x: 550, y: 480 }, dimensions: { width: 70, height: 70 }, action: logout, image: IMAGE_PATHS.logout },
        createDrug: { position: { x: 80, y: 80 }, dimensions: { width: 80, height: 70 }, path: '/drugs/create', image: IMAGE_PATHS.adminHQ },
    }), [logout]);

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
            localStorage.removeItem('jwtToken');
            navigate('/');
        } finally {
            setLoadingRole(false);
        }
    }, [navigate]);

    const checkInteraction = useCallback(() => {
        const charBounds = {
            left: charPos.x - 24 * PIXEL_SCALE,
            right: charPos.x + 24 * PIXEL_SCALE,
            top: charPos.y - 24 * PIXEL_SCALE,
            bottom: charPos.y + 24 * PIXEL_SCALE,
        };

        for (const key in interactionAreas) {
            const area = interactionAreas[key as keyof typeof interactionAreas];
            if (!area.image) continue;

            const areaBounds = {
                left: area.position.x,
                right: area.position.x + area.dimensions.width,
                top: area.position.y,
                bottom: area.position.y + area.dimensions.height,
            };

            if (charBounds.left < areaBounds.right &&
                charBounds.right > areaBounds.left &&
                charBounds.top < areaBounds.bottom &&
                charBounds.bottom > areaBounds.top) {
                if ('path' in area) {
                    navigate(area.path);
                } else if ('action' in area) {
                    area.action();
                }
                return;
            }
        }
    }, [charPos, navigate, interactionAreas]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setCharPos(prevPos => {
                let newX = prevPos.x;
                let newY = prevPos.y;

                const minX = 24 * PIXEL_SCALE;
                const maxX = MAP_WIDTH - 24 * PIXEL_SCALE;
                const minY = 24 * PIXEL_SCALE;
                const maxY = MAP_HEIGHT - 24 * PIXEL_SCALE;

                switch (e.key) {
                    case 'ArrowUp':
                        newY = Math.max(minY, prevPos.y - STEP);
                        break;
                    case 'ArrowDown':
                        newY = Math.min(maxY, prevPos.y + STEP);
                        break;
                    case 'ArrowLeft':
                        newX = Math.max(minX, prevPos.x - STEP);
                        break;
                    case 'ArrowRight':
                        newX = Math.min(maxX, prevPos.x + STEP);
                        break;
                    default:
                        return prevPos;
                }
                return { x: newX, y: newY };
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkInteraction();
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [charPos, checkInteraction]);

    if (loadingRole) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#BBDEFB' }}>
                <CircularProgress sx={{ color: '#4CAF50' }} />
                <Typography sx={{ marginLeft: 2, color: '#001F3F' }}>Loading user data...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                height: '100vh',
                backgroundColor: '#A7D9FF',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    width: `${MAP_WIDTH}px`,
                    height: `${MAP_HEIGHT}px`,
                    backgroundImage: `url(${IMAGE_PATHS.backgroundMap})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                    imageRendering: 'pixelated',
                    border: '4px solid #001F3F',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0, 31, 63, 0.3)',
                }}
            >
                {Object.entries(interactionAreas).map(([key, area]) => (
                    (key !== 'createDrug' || userRole === 'ROLE_ADMIN') && (
                        <PixelInteractiveArea
                            key={key}
                            position={area.position}
                            dimensions={area.dimensions}
                            imageSrc={area.image}
                            label={key.charAt(0).toUpperCase() + key.slice(1)}
                            onClick={() => {
                                if ('path' in area) {
                                    navigate(area.path);
                                } else if ('action' in area) {
                                    area.action();
                                }
                            }}
                        />
                    )
                ))}

                <PixelCharacter position={charPos} imageSrc={IMAGE_PATHS.character} />

                <Box sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#E0F7FA',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: `${14 * PIXEL_SCALE / 2}px`,
                    fontFamily: 'monospace',
                    imageRendering: 'pixelated',
                    zIndex: 100,
                }}>
                    Use Arrow Keys to Move
                </Box>
            </Box>
        </Box>
    );
};

export default Home;