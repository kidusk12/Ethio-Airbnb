import fs from 'fs';
import path from 'path';

import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;

    callback(null, uniqueName);
  },
});

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf', // host wizard accepts image/*,.pdf for ID document + house deed
]);

function fileFilter(req, file, callback) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return callback(
      new Error('Only JPG, PNG, WEBP, or PDF files are allowed.'),
    );
  }

  return callback(null, true);
}

export const uploadSingleImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
}).single('file');