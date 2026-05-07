import dotenv from 'dotenv';
dotenv.config();

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN);
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('JWT')));
