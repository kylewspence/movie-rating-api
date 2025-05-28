declare namespace Express {
    interface Request {
        user?: {
            userId: string;
            [key: string]: any;
        };
    }
} 