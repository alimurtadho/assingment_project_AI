require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 CodeGuardian AI Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});
