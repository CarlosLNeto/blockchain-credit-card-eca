# ECA - Electronic Credit Account

Sistema de bandeira de cartão de crédito baseado em tecnologia Blockchain.

## Descrição

ECA é uma bandeira de cartão de crédito que utiliza blockchain para registrar e validar todas as transações. O sistema oferece uma plataforma completa para processamento de pagamentos, transferências e gestão de crédito com segurança, transparência e rastreabilidade.

## Tecnologias

### Backend
- Node.js + Express
- Blockchain customizado (Proof-of-Work, SHA-256)
- JWT para autenticação
- Bcrypt para criptografia

### Frontend
- React 18
- Material-UI
- React Router
- Axios

## Funcionalidades

- Cadastro e emissão automática de cartão ECA
- Sistema de autenticação (login/logout)
- Transferências entre portadores de cartão
- Pagamentos a estabelecimentos
- Consulta de saldo e limite disponível
- Extrato completo de transações
- Extrato filtrado por período
- Blockchain com mineração automática e validação

## Instalação

### Backend

```bash
cd eca-blockchain-backend
npm install
npm start
```

Servidor disponível em: http://localhost:3001

### Frontend

```bash
cd eca-blockchain-frontend
npm install
npm start
```

Interface disponível em: http://localhost:3000

## Uso

1. Acesse http://localhost:3000
2. Crie uma conta fornecendo nome, email, CPF e senha
3. Seu cartão ECA será gerado automaticamente com limite de R$ 5.000,00
4. Utilize o dashboard para:
   - Visualizar cartão virtual
   - Realizar transferências (usando email do destinatário)
   - Efetuar pagamentos
   - Consultar extratos

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastrar usuário
- `POST /api/auth/login` - Autenticar
- `POST /api/auth/logout` - Encerrar sessão

### Transações
- `POST /api/transactions/transfer` - Transferência
- `POST /api/transactions/payment` - Pagamento
- `GET /api/transactions/balance` - Consultar saldo
- `GET /api/transactions/statement` - Extrato completo
- `GET /api/transactions/statement/period` - Extrato por período

### Blockchain
- `GET /api/blockchain/chain` - Visualizar blockchain
- `GET /api/blockchain/pending` - Transações pendentes
- `GET /api/blockchain/validate` - Validar integridade

## Arquitetura

```
Projeto03/
├── eca-blockchain-backend/
│   ├── src/
│   │   ├── blockchain/      # Implementação da blockchain
│   │   ├── models/          # Modelo de usuário
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── routes/          # Rotas da API
│   │   ├── middleware/      # Autenticação
│   │   ├── config/          # Configurações
│   │   └── server.js
│   └── package.json
│
└── eca-blockchain-frontend/
    ├── src/
    │   ├── components/      # Componentes reutilizáveis
    │   ├── pages/          # Login, Register, Dashboard
    │   ├── services/       # Integração com API
    │   ├── context/        # Estado global
    │   └── App.js
    └── package.json
```

## Características da Blockchain

- Algoritmo de Hash: SHA-256
- Consenso: Proof-of-Work
- Dificuldade de Mineração: 2
- Tipos de Transação: TRANSFER, PAYMENT, CREDIT
- Validação automática da cadeia
- Registro imutável de todas as operações

## Segurança

- Senhas criptografadas com Bcrypt (10 rounds)
- Autenticação baseada em JWT
- Tokens com expiração configurável
- Validação de transações antes da inclusão na blockchain
- Endereços de carteira únicos gerados com SHA-256

## Cartão ECA

- Prefixo: 5100 (exclusivo da bandeira)
- Geração automática de número, CVV e validade
- Limite de crédito inicial: R$ 5.000,00
- Endereço único na blockchain para cada usuário

## Observações

- Sistema acadêmico para demonstração de conceitos
- Dados armazenados em memória (reset ao reiniciar)
- Backend e frontend devem rodar simultaneamente

## Licença

ISC

## Autor

Projeto desenvolvido para a disciplina de Tópicos 4 - UEA Engenharia de Computação
