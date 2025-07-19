import multer from "multer";

const storage = multer.memoryStorage(); // buffer in RAM

export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // max 20MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only images and MP4 videos allowed!"));
  }
});
