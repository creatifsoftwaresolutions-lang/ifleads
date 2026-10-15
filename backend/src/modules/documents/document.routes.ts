import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/permission.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { audit } from '../../services/audit.service.js';
import { ListDocumentsQuerySchema } from './document.schema.js';
import { documentController } from './document.controller.js';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'documents');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).slice(0, 10);
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const unique = crypto.randomBytes(6).toString('hex');
    cb(null, `${Date.now()}_${unique}_${safeBase}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /^(image\/|application\/pdf|application\/msword|application\/vnd\.|text\/|application\/zip|application\/json)/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed'));
  },
});

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('documents:read'),
  validate(ListDocumentsQuerySchema, 'query'), documentController.list);

router.post('/', requirePermission('documents:create'),
  upload.single('file'),
  audit('document.upload', 'Document'),
  documentController.create);

router.delete('/:id', requirePermission('documents:delete'),
  audit('document.delete', 'Document'),
  documentController.remove);

export default router;
