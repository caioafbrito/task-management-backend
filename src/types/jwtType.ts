import { JwtPayload } from "jsonwebtoken";

export interface UserJwt extends JwtPayload {
    userId: string;
}