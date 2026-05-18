import { AppError } from "./app.error.js";

export class SuperAdminOnlyError extends AppError {
    constructor() {
        super({
            statusCode: 403,
            code: "SUPER_ADMIN_ONLY",
            message: "Mohon maaf, akses ini hanya tersedia untuk Super Admin",
        });
    }
}

export class AdminMasjidOnlyError extends AppError {
    constructor() {
        super({
            statusCode: 403,
            code: "ADMIN_MASJID_ONLY",
            message: "Mohon maaf, akses ini hanya tersedia untuk Admin Masjid",
        });
    }
}