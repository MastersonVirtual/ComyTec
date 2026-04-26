const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Placeholder endpoint for future Gmail sync.
 * TODO:
 * 1) Validate Firebase Auth ID token from frontend
 * 2) Resolve user UID
 * 3) Exchange OAuth code server-side and store refresh token safely
 * 4) Pull Gmail messages and write to users/{uid}/gmail_inbox
 */
exports.syncGmailPreview = onRequest(async (req, res) => {
  logger.info('syncGmailPreview called', { method: req.method });
  res.status(501).json({
    ok: false,
    message: 'Gmail sync backend not implemented yet. Project scaffold is ready.',
  });
});
