import { User } from "../entities/User";
import { Arg, Mutation, Resolver } from "type-graphql";
import argon2 from "argon2";
import { UserMutationResponse } from "../types/UserMutationResponse";

@Resolver()
export class UserResolver {
    @Mutation(_returns => UserMutationResponse, { nullable: true })
    async register(
        @Arg('email') email: string,
        @Arg('username') username: string,
        @Arg('password') password: string
    ): Promise<UserMutationResponse> {
        try {
            const existingUser = await User.findOne({
                where: [{ username }, { email }]
            })
            if (existingUser) return {
                code: 400,
                success: false,
                message: 'Duplicated username or email',
                errors: [
                    {
                        field: existingUser.username === username ? 'username' : 'email',
                        message: `${existingUser.username === username ? 'username' : 'email'} already exist`
                    }
                ]
            }

            const hashedPassword = await argon2.hash(password)

            const newUser = User.create({
                username,
                password: hashedPassword,
                email
            })

            return {
                code: 200,
                success: true,
                message: 'User registration successful',
                user: await User.save(newUser)
            }
            
        } catch (error) {
            console.log(error)
            return {
                code: 500,
                success: false,
                message: `Internal server error ${error.message}`,
            }
        }
    }
}