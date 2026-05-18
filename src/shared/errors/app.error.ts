type AppErrorOptions = {
    statusCode: number;
    code: string;
    message: string;
    errors?: Record<string, string[]>;
};

export class AppError extends Error {
    statusCode: number;
    code: string;
    errors?: Record<string, string[]>;

    constructor(options: AppErrorOptions) {
        super(options.message);

        this.name = this.constructor.name;
        this.statusCode = options.statusCode;
        this.code = options.code;
        this.errors = options.errors;

        Error.captureStackTrace(this, this.constructor);
    }
}
