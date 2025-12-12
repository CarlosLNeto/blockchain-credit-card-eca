import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <AccountBalanceIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ECA Blockchain
        </Typography>
        {isAuthenticated && (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1">
              Olá, {user?.name}
            </Typography>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Sair
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
