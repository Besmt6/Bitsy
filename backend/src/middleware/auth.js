import jwt from 'jsonwebtoken';
import Hotel from '../models/Hotel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bitsy-secret-key-change-in-production';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ error: 'Not authorized, no token' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get hotel from token
    req.hotel = await Hotel.findById(decoded.id).select('-password');
    
    if (!req.hotel) {
      return res.status(401).json({ error: 'Hotel not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d'
  });
};
