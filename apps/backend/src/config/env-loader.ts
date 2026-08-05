import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPath = path.resolve(__dirname, '../../../../.env');
console.log(`[ENV DEBUG] Resolved env path: ${envPath}, exists: ${fs.existsSync(envPath)}`);
dotenv.config({ path: envPath });

console.log(`[ENV DEBUG] DATABASE_URL in process.env: ${process.env.DATABASE_URL ? 'YES' : 'NO'}`);
