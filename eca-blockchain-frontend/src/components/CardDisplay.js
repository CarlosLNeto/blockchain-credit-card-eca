import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const CardDisplay = ({ user }) => {
  if (!user) return null;

  return (
    <Card sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: 3,
      minHeight: 200,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <CreditCardIcon sx={{ fontSize: 40 }} />
          <Typography variant="h6" fontWeight="bold">
            ECA
          </Typography>
        </Box>

        <Box>
          <Typography variant="h5" letterSpacing={2} sx={{ my: 2 }}>
            {user.cardNumber.match(/.{1,4}/g).join(' ')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Nome
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {user.name.toUpperCase()}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Validade
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {user.expirationDate}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              CVV
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {user.cvv}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardDisplay;
