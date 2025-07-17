import { Request, Response } from "express";
import { ApiError } from "utils/error.js";
import db from "../db/connection.js";

export const getAllTasksByUserId = async (req: Request, res: Response) => {
    const query = await db.execute("SELECT * FROM tasks");
    if (!query.rowCount) throw new ApiError("Nothing in the table", 404);
    return res.status(200).send(query.rows);
};
