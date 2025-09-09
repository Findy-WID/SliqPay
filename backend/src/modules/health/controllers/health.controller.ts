import { Request, Response } from 'express';
export function health(_req: Request, res: Response) {
  res.json({ status: 'ok', ts: new Date().toISOString() });
}
