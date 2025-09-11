import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate = (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({ body: req.body, query: req.query, params: req.params });
    if (!parsed.success) return next({ status: 400, message: 'Validation failed', details: parsed.error.flatten() });
    (req as any).body = parsed.data.body;
    next();
  };

export default validate;
