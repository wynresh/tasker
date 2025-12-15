import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema.user';
import config from '@/config';

@Injectable()
export default class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) {}

    create(userData: Partial<User>): Promise<UserDocument> {
        const createdUser = new this.userModel(userData);
        return createdUser.save();
    }

    get(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    find(query: any, limit: string | number, page: string | number = 1): Promise<UserDocument[]> {
        return this.userModel
            .find(query)
            .limit(Number(limit || config.Pagination.limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();
    }

    update(id: string, updateData: Partial<User>): Promise<UserDocument | null> {
        return this.userModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .exec();
    }

    delete(id: string): Promise<UserDocument | null> {
        return this.userModel.findByIdAndDelete(id).exec();
    }

    count(query: any): Promise<number> {
        return this.userModel.countDocuments(query).exec();
    }
}
