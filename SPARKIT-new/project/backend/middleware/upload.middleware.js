import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// If local disk fallback is used, create uploads directory
const uploadDir = './uploads';
if (!isCloudinaryConfigured && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Local Storage Helper
const localDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure storages based on availability of Cloudinary credentials
let productImagesStorage, productVideosStorage, reviewImagesStorage, complaintImagesStorage, avatarStorage, ewasteImagesStorage;

if (isCloudinaryConfigured) {
  productImagesStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'sparkit/products/images',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }]
    }
  });

  productVideosStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'sparkit/products/videos',
      resource_type: 'video',
      allowed_formats: ['mp4', 'mov', 'avi', 'mkv']
    }
  });

  reviewImagesStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'sparkit/reviews',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, crop: 'limit', quality: 'auto' }]
    }
  });

  complaintImagesStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'sparkit/complaints',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
  });

  avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'sparkit/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'fill' }]
    }
  });

  ewasteImagesStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'sparkit/ewaste',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1000, crop: 'limit', quality: 'auto' }]
    }
  });
} else {
  console.log("Cloudinary not configured. Falling back to local disk storage for file uploads.");
  productImagesStorage = localDiskStorage;
  productVideosStorage = localDiskStorage;
  reviewImagesStorage = localDiskStorage;
  complaintImagesStorage = localDiskStorage;
  avatarStorage = localDiskStorage;
  ewasteImagesStorage = localDiskStorage;
}

// Multer Upload Functions
export const uploadProductImages = multer({
  storage: productImagesStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    if (isImage) cb(null, true);
    else cb(new Error('Only images are allowed for product photos'), false);
  }
}).array('images', 8);

export const uploadProductVideo = multer({
  storage: productVideosStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const isVideo = file.mimetype.startsWith('video/');
    if (isVideo) cb(null, true);
    else cb(new Error('Only video files are allowed'), false);
  }
}).single('video');

export const uploadReviewImages = multer({
  storage: reviewImagesStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    if (isImage) cb(null, true);
    else cb(new Error('Only images are allowed for reviews'), false);
  }
}).array('images', 4);

export const uploadComplaintImages = multer({
  storage: complaintImagesStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    if (isImage) cb(null, true);
    else cb(new Error('Only images are allowed for complaints'), false);
  }
}).array('images', 3);

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    if (isImage) cb(null, true);
    else cb(new Error('Only images are allowed for avatars'), false);
  }
}).single('avatar');

export const uploadEwasteImages = multer({
  storage: ewasteImagesStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    if (isImage) cb(null, true);
    else cb(new Error('Only images are allowed for e-waste requests'), false);
  }
}).array('images', 5);

const combinedStorage = {
  _handleFile: (req, file, cb) => {
    const storage = file.fieldname === 'video' ? productVideosStorage : productImagesStorage;
    storage._handleFile(req, file, cb);
  },
  _removeFile: (req, file, cb) => {
    const storage = file.fieldname === 'video' ? productVideosStorage : productImagesStorage;
    storage._removeFile(req, file, cb);
  }
};

export const uploadProductMediaCombined = multer({
  storage: combinedStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max limit (video limit is high)
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      if (file.mimetype.startsWith('video/')) cb(null, true);
      else cb(new Error('Only video files are allowed in video field'), false);
    } else if (file.fieldname === 'images') {
      if (file.mimetype.startsWith('image/')) cb(null, true);
      else cb(new Error('Only images are allowed in images field'), false);
    } else {
      cb(new Error('Unexpected field name'), false);
    }
  }
}).fields([
  { name: 'images', maxCount: 8 },
  { name: 'video', maxCount: 1 }
]);
