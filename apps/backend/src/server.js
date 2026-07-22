import app from './app';
import { config } from './config';
app.listen(config.port, () => {
    console.log(`🚀 FinanceSarthi Backend server running on http://localhost:${config.port}/api/v1`);
});
