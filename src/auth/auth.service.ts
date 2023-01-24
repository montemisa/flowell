import { RegistrationRequest } from './auth.interface';
import { Injectable, HttpException, HttpStatus, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

const MIN_PASSWORD_LENGTH = 5;
@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>, private jwt: JwtService) { }

    async registerUser(registrationRequest: RegistrationRequest) {
        if (registrationRequest.password.length < MIN_PASSWORD_LENGTH) {
            throw new BadRequestException(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(registrationRequest.password, salt);
        registrationRequest.password = hash
        const userEntity = this.userRepository.create({
            ...registrationRequest
        })
        try {
            const resp = await this.userRepository.save(userEntity);
            return resp;
        } catch(e) {
            throw new BadRequestException(e.message);
        }
    }

    async validateUser(username: string, password: string): Promise<any> {
        const foundUser = await this.userRepository.findOneBy({ username });
        if (foundUser) {
            if (await bcrypt.compare(password, foundUser.password)) {
                const { password, ...result } = foundUser;
                return result;
            }
            throw new UnauthorizedException();
        }
        console.log("User does not exist");
        throw new UnauthorizedException();
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id, role:user.role };

        return {
            access_token: this.jwt.sign(payload),
        };
    }
}
