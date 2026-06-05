import { Request, Response, NextFunction } from "express";

/**
 * Async handler wrapper to eliminate try-catch blocks in controllers.
 * Catches any thrown errors and forwards them to Express error middleware.
 */
export const asyncHandler =
  <Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => Promise<void>,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
