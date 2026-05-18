import multer from "multer";


export const multerUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} tidak didukung`));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 2,
    },
});

