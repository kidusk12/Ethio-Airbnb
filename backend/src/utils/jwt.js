import jwt from 'jsonwebtoken';

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.');
  }

  return process.env.JWT_SECRET;
};

export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    getSecret(),
    { expiresIn: '7d' },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}