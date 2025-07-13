import { Request, Response } from "express";

export const getAllTasksByUserId = (req: Request, res: Response) => {
    try {
        console.log("In the controller.")
        return res.status(200).send("Working fine ;)");
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An unknown error occurred."
        });
    }
};


