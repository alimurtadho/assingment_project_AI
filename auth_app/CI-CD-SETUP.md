# CI/CD Setup Instructions

## Required GitHub Secrets

Untuk menjalankan CI/CD pipeline ini, Anda perlu menambahkan secrets berikut di GitHub repository settings:

### 1. CodeCov Token
```
CODECOV_TOKEN=your-codecov-token-here
```

**Cara mendapatkan:**
1. Buka [codecov.io](https://codecov.io)
2. Login dengan GitHub account
3. Tambahkan repository Anda
4. Copy token dari dashboard

### 2. Telegram Bot Notification (Optional)
```
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

**Cara setup Telegram Bot:**
1. Chat dengan [@BotFather](https://t.me/BotFather) di Telegram
2. Buat bot baru dengan `/newbot`
3. Copy token yang diberikan
4. Untuk mendapatkan chat ID:
   - Tambahkan bot ke grup/chat
   - Kirim pesan ke bot
   - Buka `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Copy chat ID dari response

## Cara Menambahkan Secrets di GitHub

1. Buka repository di GitHub
2. Pergi ke **Settings** → **Secrets and variables** → **Actions**
3. Klik **New repository secret**
4. Masukkan nama dan value secret
5. Klik **Add secret**

## Testing Commands

### Backend Testing
```bash
cd backend
python -m pytest --cov=. --cov-report=html --cov-report=xml --cov-report=term
```

### Frontend Testing
```bash
cd frontend
npm test -- --coverage --watchAll=false
```

### Manual Build Test
```bash
# Backend
cd backend
python -m uvicorn main:app --reload

# Frontend
cd frontend
npm run build
```
