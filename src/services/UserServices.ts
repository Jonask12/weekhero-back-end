import { compare, hash } from "bcrypt"
import { createUsersDTO } from "../dtos/createUsersDTO"
import { UserRepository } from "../repositories/UserRepository"
import { IPpdateUser } from "../dtos/IUpdateUser"
import { v4 as uuid } from "uuid";
import { s3 } from "../config/aws";
import { sign, verify } from "jsonwebtoken";


class UserServices {
  private usersRepository: UserRepository

  constructor() {
    this.usersRepository = new UserRepository()
  }
  async create({ name, email, password}: createUsersDTO) {
    const findUser = await this.usersRepository.findUserByEmail(email)

    if (findUser) {
      throw new Error('Users alreads exists!');
    }

    const hashPassword = await hash(password, 10)

    const user = await this.usersRepository.create({ name, email, password: hashPassword})
    return user;
  }

  async update({ name, oldPassword, newPassword, avatar_url, user_id }: IPpdateUser) {
    let password
    if (oldPassword && newPassword) {
      const findUserById = await this.usersRepository.findUserById(user_id);
      if (!findUserById) {
        throw new Error("User not found")
      }
      const passwordMatch = compare(oldPassword, findUserById.password);
      if (!passwordMatch) {
        throw new Error("Password invalid.");
      }
      password = await hash(newPassword, 10)
      await this.usersRepository.updatePassword(password, user_id)
    }

    if (avatar_url) {
      const uploadImage = avatar_url?.buffer
      const uploadS3 = await s3.upload({
        Bucket: 'hero-week-js',
        Key: `${uuid()}-${avatar_url?.originalname}`,
        //ACL: 'public-read',
        Body: uploadImage,
      })
      .promise();
      await this.usersRepository.update(name, uploadS3.Location, user_id);
    }
    return {
      message: 'User updated sucessfully',
    }
  }

  async auth( email: string, password: string) {
    const findUser = await this.usersRepository.findUserByEmail(email);

    if (!findUser) {
      throw new Error("User or password invalid.");
    }
    const passwordMatch = compare(password, findUser.password);

    if (!passwordMatch) {
      throw new Error("User or password invalid.");
    }

    let secretKey: string | undefined = process.env.ACESS_KEY_TOKEN;
    if (!secretKey) {
      throw new Error("There is no token")
    }

    let secretKeyRefreshToken: string | undefined = process.env.ACCESS_KEY_TOKEN_REFRESH;
    if (!secretKeyRefreshToken) {
      throw new Error("There is no token")
    }

    const token = sign({email}, secretKey, {
      subject: findUser.id,
      expiresIn: '7d',
      // expiresIn: 60 * 15,
    });

    const refreshToken = sign({email}, secretKeyRefreshToken, {
      subject: findUser.id,
      expiresIn: '7d',
    });

    return {
      token,
      refresh_token: refreshToken,
      user: {
        name: findUser.name,
        email: findUser.email,
      }
    }
  }

  async refresh(refresh_token: string) {
    if (!refresh_token) {
      throw new Error('Refresh token is missing');
    }

    let secretKeyRefresh: string | undefined = process.env.ACCESS_KEY_TOKEN_REFRESH;
    if (!secretKeyRefresh) {
      throw new Error("There is no refresh token key");
    }

    let secretKey: string | undefined = process.env.ACCESS_KEY_TOKEN_REFRESH;
    if (!secretKey) {
      throw new Error("There is no refresh token key");
    }

    const veryfyRefreshToken = await verify(refresh_token, secretKeyRefresh);

    const { sub } = veryfyRefreshToken;

    const newToken = sign({ sub }, secretKey, {
      expiresIn: 60 * 15,
    });
    return { token: newToken };
  }
}

export { UserServices }