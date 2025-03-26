// Controller 
import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getPaginatedUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.usersService.getPaginatedUsers(page, limit);
  }
}


// Service
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getPaginatedUsers(page: number, limit: number) {
    const totalRecords = await this.userModel.countDocuments();
    const users = await this.userModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
      data: users,
    };
  }
}



// user entity
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);


// get request  - GET /users?page=2&limit=5
// response 
{
  "totalRecords": 20,
  "totalPages": 4,
  "currentPage": 2,
  "limit": 5,
  "data": [
    { "id": 6, "name": "User 6" },
    { "id": 7, "name": "User 7" },
    { "id": 8, "name": "User 8" },
    { "id": 9, "name": "User 9" },
    { "id": 10, "name": "User 10" }
  ]
}


Yes! You can implement your frontend pagination logic in a NestJS API by using:

skip and limit for MongoDB (Mongoose)

skip and take for PostgreSQL/MySQL (TypeORM)
