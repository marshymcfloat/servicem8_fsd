import { AuthRegisterTypes } from '@repo/validators';

export class CreateUserDto implements Omit<AuthRegisterTypes, 'confirm_password'> {
  email: string;
  username: string;
  phone_numer: string;
  password: string;
}

