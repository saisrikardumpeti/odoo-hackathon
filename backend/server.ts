import app from './src/app';
import { env } from './src/config/env';

const PORT = parseInt(env.PORT);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
});