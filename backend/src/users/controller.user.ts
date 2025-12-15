import { Controller, Get, Post, Body, Param, Delete, Put, Req } from '@nestjs/common';
import UserService from './service.user';
import { User, UserDocument } from './schema.user';

import isStrongPassword from '../lib/strong.password.lib';
import { generateToken, verifyToken, generateAccessToken, generateRefreshToken } from '../lib/jwt.lib';
import { sendPasswordResetEmail, sendVerificationEmail } from '../service/email.service';

@Controller('users')
export default class UserController {
    constructor(private readonly userService: UserService) {}

    async authentication(user: UserDocument): Promise<{ user: UserDocument; token: { access: string; refresh: string } } | { message: string }> {
        try {
            user.online = true;
            user.status = 'active';
            await user.save();

            const access = generateAccessToken({ id: user.id, role: user.role });
            const refresh = generateRefreshToken({ id: user.id, role: user.role });

            return { 
                user, 
                token: {access, refresh }
            };
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Post()
    async verify(@Body() userData: Partial<User>): Promise<{ message: string }> {
        /*
        *   username: string;
        *   email: string;
        *   password: string;
        *   role?: 'user' | 'admin';
        */
       try {
            // verifier l'unicite de l'email et du nom d'utilisateur
            const existingUsers = await this.userService.find({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ],
            }, 1, 1);
        
            if (existingUsers.length > 0) {
                throw new Error('Email or username already in use');
            }

            // verifier la force du mot de passe (ex: longueur minimale, presence de caracteres speciaux, etc.)
            if (!userData.password || !isStrongPassword(userData.password)) {
                throw new Error('Password is not strong enough');
            }

            // si un utilisateur est identifier faisant la requete, verifier qu'il a le role admin
        
            // créer un token
            const token = generateToken(
                { email: userData.email },
                '1h' // token valable pendant 1 heure
            );

            // verifier l'email
            sendVerificationEmail(userData.email!, token);
        
            return { message: 'Verification email sent' };
       } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Get(':token')
    async create(@Param('token') token: string): Promise<{ user: UserDocument; token: { access: string; refresh: string } } | { message: string}> {
        try {
            // verifier le token
            const payload: any = verifyToken(token);

            // creer l'utilisateur
            const newUser = await this.userService.create(payload)
        
            return await this.authentication(newUser);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Post('login')
    async login(@Body() body: { identifier: string; password: string }): Promise<{ user: UserDocument; token: { access: string; refresh: string } } | { message: string}> {
        try {
            const { identifier, password } = body;

            // trouver l'utilisateur par email, nom d'utilisateur ou id
            const user = await this.userService.get(identifier);
            if (!user) {
                throw new Error('User not found');
            }

            // verifier le mot de passe
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new Error('Invalid password');
            }

            return await this.authentication(user);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Get('logout')
    async logout(@Req() req: any): Promise<{ message: string }> {
        try {
            const userId = req.user.id;
            const user = await this.userService.get(userId);
            if (!user) {
                throw new Error('User not found');
            }

            user.online = false;
            user.status = 'inactive';
            await user.save();

            return { message: 'User logged out successfully' };
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Post('forgot-password')
    async forgotPassword(@Body() body: { email: string }): Promise<{ message: string }> {
        try {
            const { email } = body;

            // trouver l'utilisateur par email
            const users = await this.userService.find({ email }, 1, 1);
            if (users.length === 0) {
                throw new Error('User not found');
            }
            const user = users[0];

            // créer un token de réinitialisation
            const token = generateToken(
                { id: user.id },
                '1h' // token valable pendant 1 heure
            );

            // envoyer l'email de réinitialisation
            sendPasswordResetEmail(user.email, token);

            return { message: 'Password reset email sent' };
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string; newPassword: string }): Promise<{ message: string }> {
        try {
            const { token, newPassword } = body;

            // verifier le token
            const payload: any = verifyToken(token);

            // trouver l'utilisateur par id
            const user = await this.userService.get(payload.id);
            if (!user) {
                throw new Error('User not found');
            }

            // verifier la force du nouveau mot de passe
            if (!isStrongPassword(newPassword)) {
                throw new Error('Password is not strong enough');
            }

            // mettre à jour le mot de passe
            user.password = newPassword;
            await user.save();

            return { message: 'Password reset successfully' };
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Post('refresh-token')
    async refreshToken(@Body() body: { refreshToken: string }): Promise<{ access: string; refresh: string } | { message: string }> {
        try {
            const { refreshToken } = body;

            // verifier le token
            const payload: any = verifyToken(refreshToken);

            // generer de nouveaux tokens
            const access = generateAccessToken({ id: payload.id, role: payload.role });
            const refresh = generateRefreshToken({ id: payload.id, role: payload.role });

            return { access, refresh };
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }
    

    @Get(':id')
    async get(@Param('id') id: string, @Req() req: any): Promise<UserDocument | { message: string} | null> {
        try {
            const userId = req.user.id;
            if (userId !== id && req.user.role !== 'admin') {
                return this.userService.get(userId);
            }

            return this.userService.get(id);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: any): Promise<User | null | { message: string}> {
        try {
            const userId = req.user.id;
            if (userId !== id && req.user.role !== 'admin') {
                return this.userService.delete(userId);
            }
        
            return this.userService.delete(id);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<User>,
        @Req() req: any
    ): Promise<User | null | { message: string}> {
        try {
            const userId = req.user.id;
            if (userId !== id && req.user.role !== 'admin') {
                return this.userService.update(userId, updateData);
            }
        
            return this.userService.update(id, updateData);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Get()
    async find(@Req() query: any): Promise<User[] | { message: string}> {
        try {
            const q = { ...query }
            const limit = q.limit || null
            if (limit) delete q[limit];

            const page = q.page || 1
            if (page) delete q[page];

            return this.userService.find(query, limit, page);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }

    @Get('count')
    async count(@Body() query: any): Promise<number | { message: string}> {
        try {
            return this.userService.count(query);
        } catch (err) {
            return { message: err instanceof Error ? err.message : 'An error occurred' }
       }
    }
}
