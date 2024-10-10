import { NextFunction, Request, RequestHandler, Response } from "express";

type CustomRequest = Request & {
  user?: any;
  file?: any;
  files?: any;
  body?: any;
};

type AsyncHandler = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

const catchAsync = (fn: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync;
