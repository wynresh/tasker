import dotenv from 'dotenv';


dotenv.config();


// mongodb config
const Uri = process.env.MONGODB_URI ! as string;

// Pagination Config
const Pagination = {
  limit: parseInt(process.env.PAGINATION_LIMIT || '10', 10),
};

// jwt config
const JWT = {
  secretKey: process.env.JWT_SECRET_KEY as string || 'your-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

export default {
  Uri,
  Pagination,
  JWT,
};
