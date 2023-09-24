import { NextFunction, Request, Response } from "express";
import { UserServices } from "../services/UserServices";

class UserController {
  private usersServices: UserServices
  constructor() {
    this.usersServices = new UserServices()
  }
  async store(request: Request, response: Response, next: NextFunction) {
    const { name, email, password } = request.body;
    
    try {
      const result = await this.usersServices.create({ name, email, password})
      return response.status(201).json(result).send()
    } catch (error) {
      next(error)
    }
  }

  async auth(request: Request, response: Response, next: NextFunction) {
    const { email, password } = request.body;
    try {
      const result = await this.usersServices.auth( email, password)
      return response.json(result)
    } catch (error) {
      next(error)
    }
  }

  async refresh(request: Request, response: Response, next: NextFunction) {
    const { refresh_token } = request.body;
    try {
      const result = await this.usersServices.refresh(refresh_token);
      return response.json(result);
    } catch (error) {
      next(error)
    }
  }

  async update(request: Request, response: Response, next: NextFunction) {
    const { name, oldPassword, newPassword,  } = request.body;
    const { user_id } = request;
    console.log(request.file)
    try {
      
      const result = await this.usersServices.update({  name, oldPassword, newPassword, avatar_url: request.file, user_id })
      return response.status(200).json(result).send()

    } catch (error) {
      next(error)
    }
  }

}

export {UserController }