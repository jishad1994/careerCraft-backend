import { UserService } from "../services/user.service";
import { Request, Response } from "express";
const userService = new UserService(); //user service

//signup controller

export const signupController = async (req: Request, res: Response) => {
    try {
        const { lastName,firstName, email, phone, password } = req.body;
        console.log(firstName,lastName);
        

        const user = await userService.signup(firstName, lastName, email, phone, password);
        return res.status(201).json({ messsage: "user registration successfull", user });
    } catch (error: any) {
        console.log(error.message);
        return res.status(400).json({ message: error.message });
    }
};
