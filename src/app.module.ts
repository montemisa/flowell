import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { PostsModule } from './posts/posts.module';
import { FeedModule } from './feed/feed.module';

@Module({
  imports: [
    AuthModule, 
    PostsModule,
    TypeOrmModule.forRoot({
        type :"sqlite",
        database: process.env.NODE_ENV === "test" ? "TestDB" : "AppDB",
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true
      }),
    FeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
