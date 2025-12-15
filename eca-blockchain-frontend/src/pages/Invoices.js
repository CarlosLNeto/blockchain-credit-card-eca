import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import { invoiceService } from '../services/api';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';

const Invoices = () => {
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [allInvoices, setAllInvoices] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  useEffect(() => {
    loadCurrentInvoice();
    loadAllInvoices();
  }, []);

  const loadCurrentInvoice = async () => {
    try {
      const response = await invoiceService.getCurrentInvoice();
      setCurrentInvoice(response.data.invoice);
    } catch (err) {
      console.error('Error loading current invoice:', err);
    }
  };

  const loadAllInvoices = async () => {
    try {
      const response = await invoiceService.getAllInvoices();
      setAllInvoices(response.data.invoices);
    } catch (err) {
      console.error('Error loading invoices:', err);
    }
  };

  const loadInvoiceByMonth = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getInvoiceByMonth(selectedMonth, selectedYear);
      setSelectedInvoice(response.data.invoice);
      setError('');
    } catch (err) {
      setError('Fatura não encontrada para este período');
      setSelectedInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      setError('Digite um valor válido para pagamento');
      return;
    }

    try {
      setLoading(true);
      await invoiceService.payInvoice({
        invoiceId: currentInvoice.id,
        amount: parseFloat(paymentAmount)
      });
      setSuccess('Pagamento realizado com sucesso!');
      setPaymentAmount('');
      loadCurrentInvoice();
      loadAllInvoices();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status) => {
    const colors = {
      'OPEN': 'info',
      'CLOSED': 'default',
      'PAID': 'success',
      'OVERDUE': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'OPEN': 'Aberta',
      'CLOSED': 'Fechada',
      'PAID': 'Paga',
      'OVERDUE': 'Vencida'
    };
    return labels[status] || status;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Minhas Faturas
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Grid container spacing={3}>
        {/* Fatura Atual */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fatura Atual - {months[new Date().getMonth()]} {new Date().getFullYear()}
              </Typography>
              
              {currentInvoice && (
                <Box>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Valor Total
                      </Typography>
                      <Typography variant="h5" color="primary">
                        {formatCurrency(currentInvoice.totalAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Valor Pago
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(currentInvoice.paidAmount)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Saldo Devedor
                      </Typography>
                      <Typography variant="h5" color="error.main">
                        {formatCurrency(currentInvoice.remainingBalance)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip 
                        label={getStatusLabel(currentInvoice.status)} 
                        color={getStatusColor(currentInvoice.status)}
                        sx={{ mt: 1 }}
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Vencimento: {formatDate(currentInvoice.dueDate)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pagamento Mínimo: {formatCurrency(currentInvoice.minimumPayment)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Taxa de Juros: {currentInvoice.interestRate}% ao mês
                    </Typography>
                  </Box>

                  {currentInvoice.remainingBalance > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Realizar Pagamento
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                        <TextField
                          label="Valor do Pagamento"
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          inputProps={{ step: '0.01', min: '0' }}
                          sx={{ flexGrow: 1 }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<PaymentIcon />}
                          onClick={handlePayInvoice}
                          disabled={loading}
                        >
                          Pagar
                        </Button>
                      </Box>
                      <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => setPaymentAmount(currentInvoice.minimumPayment)}
                        >
                          Pagar Mínimo
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setPaymentAmount(currentInvoice.remainingBalance)}
                        >
                          Pagar Total
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {currentInvoice.transactions && currentInvoice.transactions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Transações da Fatura
                      </Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Data</TableCell>
                              <TableCell>Descrição</TableCell>
                              <TableCell>Parcelas</TableCell>
                              <TableCell align="right">Valor</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {currentInvoice.transactions.map((tx, index) => (
                              <TableRow key={index}>
                                <TableCell>{formatDate(tx.timestamp)}</TableCell>
                                <TableCell>{tx.description}</TableCell>
                                <TableCell>
                                  {tx.installments > 1 ? 
                                    `${tx.currentInstallment}/${tx.installments}x de ${formatCurrency(tx.installmentAmount)}` : 
                                    'À vista'
                                  }
                                </TableCell>
                                <TableCell align="right">{formatCurrency(tx.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Consultar Fatura por Mês */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Consultar Fatura de Outro Mês
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                select
                label="Mês"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                sx={{ minWidth: 150 }}
              >
                {months.map((month, index) => (
                  <MenuItem key={index} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Ano"
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                sx={{ width: 120 }}
              />
              <Button
                variant="contained"
                onClick={loadInvoiceByMonth}
                disabled={loading}
              >
                Buscar
              </Button>
            </Box>

            {selectedInvoice && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {months[selectedMonth - 1]} {selectedYear}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography variant="h6">{formatCurrency(selectedInvoice.totalAmount)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Pago</Typography>
                    <Typography variant="h6">{formatCurrency(selectedInvoice.paidAmount)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Saldo</Typography>
                    <Typography variant="h6">{formatCurrency(selectedInvoice.remainingBalance)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Chip 
                      label={getStatusLabel(selectedInvoice.status)} 
                      color={getStatusColor(selectedInvoice.status)}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Lista de Todas as Faturas */}
        {allInvoices.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Histórico de Faturas
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Período</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Pago</TableCell>
                      <TableCell>Saldo</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Vencimento</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{months[invoice.month - 1]} {invoice.year}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{formatCurrency(invoice.paidAmount)}</TableCell>
                        <TableCell>{formatCurrency(invoice.remainingBalance)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(invoice.status)} 
                            color={getStatusColor(invoice.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Invoices;
