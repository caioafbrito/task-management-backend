import { JwtPayload } from "jsonwebtoken";

export interface UserJwtPayload {
  userId: number;
  userName: string;
}

export interface UserJwt extends JwtPayload, UserJwtPayload {};

