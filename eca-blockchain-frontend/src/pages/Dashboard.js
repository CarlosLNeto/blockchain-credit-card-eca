import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { transactionService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import CardDisplay from '../components/CardDisplay';
import SendIcon from '@mui/icons-material/Send';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [transferData, setTransferData] = useState({
    toEmail: '',
    amount: '',
    description: '',
  });

  const [paymentData, setPaymentData] = useState({
    merchantName: '',
    amount: '',
    description: '',
    installments: 1,
  });

  const [periodFilter, setPeriodFilter] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadBalance();
    loadTransactions();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await transactionService.getBalance();
      setBalance(response.data);
    } catch (err) {
      console.error('Error loading balance:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await transactionService.getStatement();
      setTransactions(response.data.transactions);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await transactionService.transfer({
        toEmail: transferData.toEmail,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
      });
      setSuccess('Transferência realizada com sucesso!');
      setTransferData({ toEmail: '', amount: '', description: '' });
      loadBalance();
      loadTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar transferência');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await transactionService.payment({
        merchantName: paymentData.merchantName,
        amount: parseFloat(paymentData.amount),
        description: paymentData.description,
        installments: parseInt(paymentData.installments),
      });
      
      const installmentsText = paymentData.installments > 1 
        ? ` em ${paymentData.installments}x de ${formatCurrency(response.data.installmentAmount)}`
        : '';
      
      setSuccess(`Pagamento realizado com sucesso${installmentsText}!`);
      setPaymentData({ merchantName: '', amount: '', description: '', installments: 1 });
      loadBalance();
      loadTransactions();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao realizar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByPeriod = async () => {
    if (!periodFilter.startDate || !periodFilter.endDate) {
      setError('Por favor, selecione as datas de início e fim');
      return;
    }

    setLoading(true);
    try {
      const response = await transactionService.getStatementByPeriod(
        periodFilter.startDate,
        periodFilter.endDate
      );
      setTransactions(response.data.transactions);
      setSuccess('Extrato filtrado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao filtrar extrato');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CardDisplay user={user} />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Saldo Disponível
              </Typography>
              {balance ? (
                <>
                  <Typography variant="h4" color="primary" gutterBottom>
                    {formatCurrency(balance.balance)}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Limite: {formatCurrency(balance.creditLimit)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Utilizado: {formatCurrency(balance.used)}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/invoices')}
                    startIcon={<ReceiptIcon />}
                  >
                    Ver Faturas
                  </Button>
                </>
              ) : (
                <CircularProgress />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<SendIcon />} label="Transferir" />
              <Tab icon={<PaymentIcon />} label="Pagar" />
              <Tab icon={<ReceiptIcon />} label="Extrato" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
              {tabValue === 0 && (
                <Box component="form" onSubmit={handleTransfer}>
                  <Typography variant="h6" gutterBottom>
                    Transferir para outro usuário
                  </Typography>
                  <TextField
                    fullWidth
                    label="Email do destinatário"
                    type="email"
                    value={transferData.toEmail}
                    onChange={(e) => setTransferData({ ...transferData, toEmail: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Valor"
                    type="number"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                    margin="normal"
                    required
                    inputProps={{ step: '0.01', min: '0.01' }}
                  />
                  <TextField
                    fullWidth
                    label="Descrição (opcional)"
                    value={transferData.description}
                    onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                    margin="normal"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Transferindo...' : 'Transferir'}
                  </Button>
                </Box>
              )}

              {tabValue === 1 && (
                <Box component="form" onSubmit={handlePayment}>
                  <Typography variant="h6" gutterBottom>
                    Realizar Pagamento
                  </Typography>
                  <TextField
                    fullWidth
                    label="Nome do estabelecimento"
                    value={paymentData.merchantName}
                    onChange={(e) => setPaymentData({ ...paymentData, merchantName: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Valor"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    margin="normal"
                    required
                    inputProps={{ step: '0.01', min: '0.01' }}
                  />
                  <TextField
                    fullWidth
                    select
                    label="Parcelas"
                    value={paymentData.installments}
                    onChange={(e) => setPaymentData({ ...paymentData, installments: e.target.value })}
                    margin="normal"
                    helperText="Parcelamentos acima de 3x têm juros de 2.5% ao mês"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map((num) => (
                      <MenuItem key={num} value={num}>
                        {num}x {paymentData.amount && num > 1 ? `(${formatCurrency(paymentData.amount / num)}/mês)` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="Descrição (opcional)"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                    margin="normal"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Pagar'}
                  </Button>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Extrato de Transações
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                      label="Data Inicial"
                      type="date"
                      value={periodFilter.startDate}
                      onChange={(e) => setPeriodFilter({ ...periodFilter, startDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="Data Final"
                      type="date"
                      value={periodFilter.endDate}
                      onChange={(e) => setPeriodFilter({ ...periodFilter, endDate: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button variant="outlined" onClick={handleFilterByPeriod}>
                      Filtrar
                    </Button>
                    <Button variant="text" onClick={() => {
                      setPeriodFilter({ startDate: '', endDate: '' });
                      loadTransactions();
                    }}>
                      Limpar
                    </Button>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Data</TableCell>
                          <TableCell>Tipo</TableCell>
                          <TableCell>Descrição</TableCell>
                          <TableCell>Outra Parte</TableCell>
                          <TableCell>Parcelas</TableCell>
                          <TableCell align="right">Valor</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((tx, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(tx.timestamp)}</TableCell>
                            <TableCell>{tx.transactionType}</TableCell>
                            <TableCell>{tx.description}</TableCell>
                            <TableCell>{tx.otherParty}</TableCell>
                            <TableCell>
                              {tx.installments > 1 ? `${tx.installments}x` : 'À vista'}
                            </TableCell>
                            <TableCell align="right" sx={{
                              color: tx.transactionType === 'RECEIVED' || tx.transactionType === 'CREDIT'
                                ? 'success.main'
                                : 'error.main'
                            }}>
                              {tx.transactionType === 'RECEIVED' || tx.transactionType === 'CREDIT' ? '+' : '-'}
                              {formatCurrency(tx.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
