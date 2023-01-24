import { Body, Controller, Get, Post, UseGuards, Request, Delete, Param} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePostRequest, DeletePostRequest } from './posts.interface';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(@Body() createPostRequest: CreatePostRequest, @Request() req) {
    return this.postsService.createPost(createPostRequest, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(@Param() params, @Request() req) {
    return this.postsService.deletePost(params.id, req.user.userId);
  }
}
