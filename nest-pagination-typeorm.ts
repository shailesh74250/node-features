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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getPaginatedUsers(page: number, limit: number) {
    const [users, totalRecords] = await this.userRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
      limit,
      data: users,
    };
  }
}

// User entity
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}

// API get request GET /users?page=2&limit=5
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
