import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './service.user';
import { User, UserDocument } from './schema.user';

import isStrongPassword from '../lib/strong.password.lib';
import { generateToken, verifyToken, generateAccessToken, generateRefreshToken } from '../lib/jwt.lib';
import sendVerificationEmail from '../service/email.service';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    async authentication(user: UserDocument): Promise<{ user: UserDocument; token: { access: string; refresh: string } }> {
        user.online = true;
        user.status = 'active';
        await user.save();

        const access = generateAccessToken({ id: user.id, role: user.role });
        const refresh = generateRefreshToken({ id: user.id, role: user.role });

        return { 
            user, 
            token: {access, refresh }
        };
    }

    @Post()
    async verify(@Body() userData: Partial<User>): Promise<boolean> {
        /*
        *   username: string;
        *   email: string;
        *   password: string;
        *   role?: 'user' | 'admin';
        */
        // verifier l'unicite de l'email et du nom d'utilisateur
        const existingUsers = await this.userService.find({
            $or: [
                { email: userData.email },
                { username: userData.username }
            ],
        });
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

        return true;
    }

    @Get(':token')
    async create(@Param('token') token: string): Promise<{ user: UserDocument; token: { access: string; refresh: string } }> {
        // verifier le token
        const payload: any = verifyToken(token);

        // creer l'utilisateur
        const newUser = await this.userService.create(payload)
        
        return await this.authentication(newUser);
    }

    @Post('login')
    async login(@Body() body: { identifier: string; password: string }): Promise<{ user: UserDocument; token: { access: string; refresh: string } }> {
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
    }

    @Get('logout')
    

    @Get(':id')
    async get(@Param('id') id: string): Promise<User | null> {
        return this.userService.get(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<User | null> {
        return this.userService.delete(id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<User>,
    ): Promise<User | null> {
        return this.userService.update(id, updateData);
    }

    @Get()
    async find(@Body() query: any): Promise<User[]> {
        return this.userService.find(query);
    }

    @Get('count')
    async count(@Body() query: any): Promise<number> {
        return this.userService.count(query);
    }
}