import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../entity/post.entity';

@Module({
  providers: [FeedService],
  controllers: [FeedController],
  imports: [
    TypeOrmModule.forFeature([Post]),
  ]
})
export class FeedModule {}
