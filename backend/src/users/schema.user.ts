import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export interface UserDocument extends Document {
    id: string;
    _id: mongoose.Types.ObjectId;
    username: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
    online?: boolean;
    status?: 'active' | 'inactive' | 'banned';
    createdAt?: Date;
    updatedAt?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true, unique: true })
    username!: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ enum: ['user', 'admin'], default: 'user' })
    role?: 'user' | 'admin';

    @Prop({ default: false })
    online?: boolean;

    @Prop({ enum: ['active', 'inactive', 'banned'], default: 'active' })
    status?: 'active' | 'inactive' | 'banned';

    createdAt?: Date;
    updatedAt?: Date;

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete (ret as any)._id;
  },
});

// Middleware to hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
    if (!this.isModified('password')) return next;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// indexes
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });

