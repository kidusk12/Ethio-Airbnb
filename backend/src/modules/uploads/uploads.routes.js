import { Router } from 'express';

import { authenticate } from '../../middleware/auth.js';
import { uploadSingleImage } from '../../middleware/upload.js';
import { uploadFile } from './uploads.controller.js';

const uploadRouter = Router();

uploadRouter.post('/', authenticate, uploadSingleImage, uploadFile);

export default uploadRouter;