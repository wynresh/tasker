import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema.user';

@Injectable()
export class UserService {
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

    find(query: any): Promise<UserDocument[]> {
        return this.userModel.find(query).exec();
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
