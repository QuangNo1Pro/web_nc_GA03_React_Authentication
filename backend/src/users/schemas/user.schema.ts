import { Schema, Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  password: string;
  createdAt: Date;
}


export const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

UserSchema.set('toJSON', {
  transform: function (doc, ret: any) {
    delete ret.password;
    return ret;
  },
});