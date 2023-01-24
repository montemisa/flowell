import { Injectable, HttpException, HttpStatus, UnauthorizedException, Request, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';
import { Post } from '../entity/post.entity';
import { CreatePostRequest } from './posts.interface';

@Injectable()
export class PostsService {    
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>, 
        @InjectRepository(Post) private postRepository: Repository<Post>) { }


  async createPost(createRequest: CreatePostRequest, userId: number) {
    if (!createRequest.text || !createRequest.title) {
      throw new BadRequestException('Both text and title required for post');
    }
    const postEntity = this.postRepository.create({
        ...createRequest,
        creatorId: userId,
    });

    return await this.postRepository.save(postEntity);
  }

  async deletePost(id: number, userId: number) {
    const post = await this.postRepository.findOneBy({id});
    if (!post) {
        throw new NotFoundException();
    }
    if (post.creatorId !== userId) {
        throw new UnauthorizedException();
    }
    return this.postRepository.delete(post.id);
  }
}
