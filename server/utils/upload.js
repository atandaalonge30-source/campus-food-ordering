const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// --------------------------------------------------------------------------
// STORAGE ABSTRACTION
// --------------------------------------------------------------------------
// For the academic demo, files are written to local disk (server/uploads)
// and served statically from /uploads/<filename>. This is fine for a local
// or single-instance demo but NOT for production on Vercel, since Vercel's
// filesystem is ephemeral/read-only outside /tmp and won't persist uploads
// between requests or deployments.
//
// For production, replace this local disk storage with an external
// object-storage provider (e.g. Cloudinary, AWS S3, or Supabase Storage):
//   1. Swap `diskStorage` below for the provider's multer-compatible storage
//      engine (e.g. multer-storage-cloudinary).
//   2. Save the returned public URL in the `image` / `logo` column instead
//      of a local filename.
//   3. No other code changes are required — controllers only deal with
//      `req.file.filename` (local) or `req.file.path` (cloud URL), which
//      you would adapt in the two upload controllers.
// --------------------------------------------------------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  }
});

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, PNG and WEBP images are allowed.'));
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
