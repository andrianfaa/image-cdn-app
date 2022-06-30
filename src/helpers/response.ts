import type { Response } from "express";

interface SendResponseOptions<T> {
  status?: "success" | "error";
  statusCode?: number;
  message: string;
  data?: T;
}

const SendResponse = <T>(res: Response, code: number, options: Pick<SendResponseOptions<T>, "status" | "message" | "data">) => {
  const {
    status = "success", message, data,
  } = options;

  return res.status(code).json({
    status,
    statusCode: code,
    message,
    data,
  });
};

export default SendResponse;
