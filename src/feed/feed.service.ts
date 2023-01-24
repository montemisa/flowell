import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../entity/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(Post) private postRepository: Repository<Post>) { }

    async getFeed(creatorId: number) {
        return this.postRepository.findBy({creatorId});
    }

}
