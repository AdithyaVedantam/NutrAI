import { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 does not catch errors thrown inside async routes.
// This wrapper forwards them to the error handler in server.ts.
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };
