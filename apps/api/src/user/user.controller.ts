import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  @Post('verify-credentials')
  @HttpCode(HttpStatus.OK)
  async verifyCredentials(@Body() loginDto: LoginDto) {
    const user = await this.userService.verifyUserCredentials(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }
    return { success: true, user };
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      return null;
    }
    return user;
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      return null;
    }
    return user;
  }
}
