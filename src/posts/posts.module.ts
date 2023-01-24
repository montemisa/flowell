import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entity/post.entity';
import { User } from '../entity/user.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
    providers: [PostsService],
    controllers: [PostsController],
    imports: [
      TypeOrmModule.forFeature([Post]),
      TypeOrmModule.forFeature([User]),
    ]
  })
  export class PostsModule {}
