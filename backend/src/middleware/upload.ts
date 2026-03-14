import multer from 'multer';
import path from 'path';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, PDF, DOC, and DOCX files are allowed.'));
  }
};

export const uploadSingle = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter
}).single('file');

export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit per file
    files: 5 // Maximum 5 files
  },
  fileFilter
}).array('files', 5);

export default { uploadSingle, uploadMultiple };
