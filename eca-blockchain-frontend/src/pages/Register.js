import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <AccountBalanceIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography component="h1" variant="h5">
              Solicitar Cartão ECA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Preencha os dados para receber seu cartão
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome Completo"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="CPF"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Solicitar Cartão ECA'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Já possui cartão ECA? Faça login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
