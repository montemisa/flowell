import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getFeed(@Request() req) {
        return this.feedService.getFeed(req.user.userId);
    }
}
