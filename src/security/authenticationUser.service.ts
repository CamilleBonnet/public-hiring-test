import { Request } from "express";

export class AuthenticationUserService {
  constructor() {}

  public isGranted(_request: Request): void {
    // Here we would deal with the token sent in the request
    // if no token OR token invalid OR no token => THROW
    return;
  }
}
