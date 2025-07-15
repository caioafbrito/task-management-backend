import { Request, Response } from "express";
import pool from "../db/connection.js";

export const getAllTasksByUserId = async (req: Request, res: Response) => {
    try {
        const query = await pool.query(`SELECT * FROM tasks`);
        console.log(query.rows);
        return res.status(200).send();
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An unknown error occurred."
        });
    }
};

async function createTable() {

}


