import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/entity/user.entity';
import { Post } from '../src/entity/post.entity';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "sqlite", 
      database: "TestDB",
      entities: [__dirname + "/../src/**/*.entity{.ts,.js}"],
      synchronize: true,
    });

    await dataSource.initialize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('auth', () => {

    describe('register', () => {
      beforeEach(async () => {
        const repository = dataSource.getRepository(User);
        await repository.clear();
      });
  
      it('/auth/register (POST)', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({email: 'fake@gmail.com', username: 'fakeusername', password:'fakepassword'})
          .expect(201)
          .expect('{"message":"User created successfully"}');
      });

      it('/auth/register (POST) fails password too short', () => {
        return request(app.getHttpServer())
          .post('/auth/register')
          .send({email: 'fake@gmail.com', username: 'fakeusername', password:'fake'})
          .expect(400)
          .expect('{"statusCode":400,"message":"Password must be at least 5 characters","error":"Bad Request"}');
      });
    
      it('/auth/register (POST) fails email exists', async () => {
        const userRepository = dataSource.getRepository(User);
        const existingUserInfo = {
          email: 'fake@gmail.com', 
          username: 'fakeusername', 
          password:'fakepassword'
        };
        
        await userRepository.save(userRepository.create(existingUserInfo))
  
        const newUserInfo = {
          email: existingUserInfo.email,
          username: 'newfakeusername',
          password: 'fakepassword',
        }
        return request(app.getHttpServer())
        .post('/auth/register')
        .send(newUserInfo)
        .expect(400)
        .expect('{"statusCode":400,"message":"SQLITE_CONSTRAINT: UNIQUE constraint failed: user.email","error":"Bad Request"}')
      });
  
      it('/auth/register (POST) fails username exists', async () => {
        const userRepository = dataSource.getRepository(User);
        const existingUserInfo = {
          email: 'fake@gmail.com', 
          username: 'fakeusername', 
          password:'fakepassword'
        };
        
        await userRepository.save(userRepository.create(existingUserInfo))
  
        const newUserInfo = {
          email: 'newfake@gmail.com',
          username: existingUserInfo.username,
          password: 'fakepassword',
        }
        return request(app.getHttpServer())
        .post('/auth/register')
        .send(newUserInfo)
        .expect(400)
        .expect('{"statusCode":400,"message":"SQLITE_CONSTRAINT: UNIQUE constraint failed: user.username","error":"Bad Request"}')
      });
    });

    describe('login', () => {

      beforeAll(async () => {
        const repository = dataSource.getRepository(User);
        await repository.clear();

        await request(app.getHttpServer())
        .post('/auth/register')
        .send({email: 'fake@gmail.com', username: 'fakeusername', password:'fakepassword'})
      });


      it('auth/login (POST)', () => {
        return request(app.getHttpServer())
        .post('/auth/login')
        .send({username: 'fakeusername', password:'fakepassword'})
        .expect(201)
        .expect(((res) => {
          expect(res.body.access_token).toBeDefined();
        }));
      });

      it('auth/login (POST) fails wrong email', () => {
        return request(app.getHttpServer())
        .post('/auth/login')
        .send({username: 'wrongfakeusername', password:'fakepassword'})
        .expect(401)
        .expect('{"statusCode":401,"message":"Unauthorized"}');
      });

      it('auth/login (POST) fails wrong password', () => {
        return request(app.getHttpServer())
        .post('/auth/login')
        .send({username: 'fakeusername', password:'wrongfakepassword'})
        .expect(401)
        .expect('{"statusCode":401,"message":"Unauthorized"}');
      });
    });
  });

  describe('posts', () => {
    let access_token: string;

    beforeAll(async () => {
      const postRepository = dataSource.getRepository(Post);
      await postRepository.clear();
      const repository = dataSource.getRepository(User);
      await repository.clear();

      await request(app.getHttpServer())
        .post('/auth/register')
        .send({email: 'fake@gmail.com', username: 'fakeusername', password:'fakepassword'});

        const loginResp = await request(app.getHttpServer())
        .post('/auth/login')
        .send({username: 'fakeusername', password:'fakepassword'})
        .expect(201)

        access_token = loginResp.body.access_token;
    });
    describe('creating', () => {
      it('/posts (POST)', () => {
        return request(app.getHttpServer())
        .post('/posts')
        .set({Authorization: `Bearer ${access_token}`})
        .send({title:'faketitle', text:'faketext'})
        .expect(201)
      });

      it('/posts (POST) fails no jwt', () => {
        return request(app.getHttpServer())
        .post('/posts')
        .set({Authorization: `Bearer`})
        .send({title:'faketitle'})
        .expect(401)
      });

      it('/posts (POST) fails no text', () => {
        return request(app.getHttpServer())
        .post('/posts')
        .set({Authorization: `Bearer ${access_token}`})
        .send({title:'faketitle'})
        .expect(400)
      });

      it('/posts (POST) fails no title', () => {
        return request(app.getHttpServer())
        .post('/posts')
        .set({Authorization: `Bearer ${access_token}`})
        .send({text:'faketext'})
        .expect(400)
      });
    });

    describe('deleting', () => {
      let post1: Post;
      let post2: Post;
      let user: User;

      beforeAll(async () => {
        const postRepository = dataSource.getRepository(Post);
        await postRepository.clear();
        const userRepository = await dataSource.getRepository(User);

        user = await userRepository.findOneBy({username: 'fakeusername'});

        post1 = await postRepository.save(postRepository.create({
          text: 'faketext1',
          title: 'faketitle1',
          creatorId: user.id,
        }));

        post2 = await postRepository.save(postRepository.create({
          title: 'faketitle2',
          text: 'faketext2',
          creatorId: user.id,
        }));
      });

      it('/posts/:id (DELETE)', async () => {
        return request(app.getHttpServer())
        .delete(`/posts/${post1.id}`)
        .set({Authorization: `Bearer ${access_token}`})
        .expect(200);
      });

      it('/posts/:id (DELETE) fails not found', async () => {
        return request(app.getHttpServer())
        .delete(`/posts/${post1.id}`)
        .set({Authorization: `Bearer ${access_token}`})
        .expect(404);
      });

      it('/posts/:id (DELETE) fails not authorized', async () => {
        await request(app.getHttpServer())
        .post('/auth/register')
        .send({email: 'fake2@gmail.com', username: 'fakeusername2', password:'fakepassword2'});

        const loginResp = await request(app.getHttpServer())
        .post('/auth/login')
        .send({username: 'fakeusername2', password:'fakepassword2'})
        .expect(201)

        const access_token2 = loginResp.body.access_token;
        
        return request(app.getHttpServer())
        .delete(`/posts/${post2.id}`)
        .set({Authorization: `Bearer ${access_token2}`})
        .expect(401);
      });

    });
  });

  describe('feed', () => {
    let access_token: string;

    beforeAll(async () => {
      const postRepository = dataSource.getRepository(Post);
      await postRepository.clear();
      const repository = dataSource.getRepository(User);
      await repository.clear();

      await request(app.getHttpServer())
      .post('/auth/register')
      .send({email: 'fake@gmail.com', username: 'fakeusername', password:'fakepassword'});

      const loginResp = await request(app.getHttpServer())
      .post('/auth/login')
      .send({username: 'fakeusername', password:'fakepassword'})
      .expect(201)

      access_token = loginResp.body.access_token;

      await request(app.getHttpServer())
      .post('/posts')
      .set({Authorization: `Bearer ${access_token}`})
      .send({title:'faketitle1', text:'faketext1'})
      .expect(201);

      await request(app.getHttpServer())
      .post('/posts')
      .set({Authorization: `Bearer ${access_token}`})
      .send({title:'faketitle2', text:'faketext2'})
      .expect(201);

      await request(app.getHttpServer())
      .post('/posts')
      .set({Authorization: `Bearer ${access_token}`})
      .send({title:'faketitle3', text:'faketext3'})
      .expect(201);
    });

    it('/feed (GET)', async () => {

      const resp = await request(app.getHttpServer())
      .get('/feed')
      .set({Authorization: `Bearer ${access_token}`})
      .expect(200)

      expect(resp.body.length).toEqual(3);
    });


    it('/feed (GET) fails no jwt', async () => {

      const resp = await request(app.getHttpServer())
      .get('/feed')
      .set({Authorization: `Bearer `})
      .expect(401)

    });
  });
});
