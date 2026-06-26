const express = require('express');
const router = express.Router();
const AttachmentController = require('../controllers/attachmentController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { blockIfMustResetPassword } = require('../middleware/requirePasswordReset');
const upload = require('../middleware/uploadMiddleware');

const canView = requireRole('Admin', 'Project Manager', 'Collaborator');
const canUpload = requireRole('Admin', 'Project Manager', 'Collaborator');
const canDelete = requireRole('Admin', 'Project Manager');

// BE-15: first-login reset gate is applied to every attachment route (was missing here).
router.post(
  '/upload',
  verifyToken,
  blockIfMustResetPassword,
  canUpload,
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        const message =
          err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 5 MB)' : err.message;
        return res.status(400).json({ errorCode: 'UPLOAD_ERROR', message });
      }
      next();
    });
  },
  AttachmentController.uploadAttachment
);

router.get('/download/:id', verifyToken, blockIfMustResetPassword, canView, AttachmentController.downloadAttachment);

router.delete('/:id', verifyToken, blockIfMustResetPassword, canDelete, AttachmentController.deleteAttachment);

router.get('/:task_id', verifyToken, blockIfMustResetPassword, canView, AttachmentController.getAttachmentsByTask);

router.post('/', verifyToken, blockIfMustResetPassword, canUpload, AttachmentController.addAttachment);

module.exports = router;
