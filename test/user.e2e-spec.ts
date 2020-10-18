import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import AppModule from '../src/app.module';
import tables from './dbtruncate.helper';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let accessToken : string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    const connection = getConnection();
    /* eslint-disable-next-line no-restricted-syntax */
    for (const table of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await connection.query(`delete from ${table}`);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await request(app.getHttpServer())
      .post('/register')
      .send({
        name: 'test user',
        email: 'test@email.com',
        password: 'password123',
        password2: 'password123',
      })
      .expect(201);
    const res = await request(app.getHttpServer())
      .post('/login')
      .send({
        username: 'test@email.com',
        password: 'password123',
      })
      .expect(201);
    accessToken = res.body.access_token;
  });

  afterEach(async () => {
    const connection = getConnection();
    /* eslint-disable-next-line no-restricted-syntax */
    for (const table of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await connection.query(`delete from ${table}`);
    }
  });

  describe('/update (POST)', () => {
    it('name should be updated', async () => {
      const profileBefore = await request(app.getHttpServer())
        .get('/users/profile')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(profileBefore.body.name).toEqual('test user');

      await request(app.getHttpServer())
        .put('/users')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'testname',
        })
        .expect(200);

      const profileAfter = await request(app.getHttpServer())
        .get('/users/profile')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(profileAfter.body.name).toEqual('testname');
    });

    it('password should be updated if both match', async () => {
      await request(app.getHttpServer())
        .post('/login')
        .send({
          username: 'test@email.com',
          password: 'new_pass',
        })
        .expect(401);

      await request(app.getHttpServer())
        .put('/users')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          password: 'new_pass',
          password2: 'new_pass',
        })
        .expect(200);

      await request(app.getHttpServer())
        .post('/login')
        .send({
          username: 'test@email.com',
          password: 'new_pass',
        })
        .expect(201);
    });

    it('password should not be updated if they do not match', async () => {
      await request(app.getHttpServer())
        .put('/users')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          password: 'new_pass',
          password2: 'new_pass2',
        })
        .expect(400);
    });

    it('email should not be updated', async () => {
      const profileBefore = await request(app.getHttpServer())
        .get('/users/profile')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(profileBefore.body.email).toEqual('test@email.com');

      await request(app.getHttpServer())
        .put('/users')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          email: 'new_email@host.com',
        })
        .expect(200);

      const profileAfter = await request(app.getHttpServer())
        .get('/users/profile')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(profileAfter.body.email).toEqual('test@email.com');
    });
  });
  describe('/profile (GET)', () => {
    it('profile should return user data', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/profile')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(res).toHaveProperty('body');
      const user = res.body;
      expect(user.name).toEqual('test user');
      expect(user.email).toEqual('test@email.com');
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('password2');
      expect(user).toHaveProperty('id');
    });

    it('profile with wrong authorization should return 401', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set({ Authorization: `Bearer ${accessToken.slice(1)}` })
        .expect(401);
    });
  });
});
