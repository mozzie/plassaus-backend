import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import AppModule from '../src/app.module';
import tables from './dbtruncate.helper';

describe('AppController (e2e)', () => {
  let app: INestApplication;

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
  });

  afterEach(async () => {
    const connection = getConnection();
    /* eslint-disable-next-line no-restricted-syntax */
    for (const table of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await connection.query(`delete from ${table}`);
    }
  });

  describe('/register (POST)', () => {
    it('valid user should be saved to database', async () => {
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'testname',
          email: 'test@email.com',
          password: 'password123',
          password2: 'password123',
        })
        .expect(201);
    });

    it('user with bad email should not be allowed', async () => {
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'testname',
          email: 'notamailaddress.com',
          password: 'password123',
          password2: 'password123',
        })
        .expect(400);
    });

    it('user with mismatching passwords should not be allowed', async () => {
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'testname',
          email: 'test@email.com',
          password: 'password123',
          password2: 'password12',
        })
        .expect(400);
    });

    it('user with short name should not be allowed', async () => {
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 't',
          email: 'test@email.com',
          password: 'password123',
          password2: 'password123',
        })
        .expect(400);
    });

    it('existing email should not be allowed', async () => {
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'testname',
          email: 'test@email.com',
          password: 'password123',
          password2: 'password123',
        })
        .expect(201);
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'testname',
          email: 'test@email.com',
          password: 'password123',
          password2: 'password123',
        })
        .expect(400);
    });
  });

  describe('/login (POST)', () => {
    it('login should return an access token', async () => {
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'test user',
          email: 'testing_user@email.com',
          password: 'password123',
          password2: 'password123',
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/login')
        .send({
          username: 'testing_user@email.com',
          password: 'password123',
        })
        .expect(201);
      expect(res).toHaveProperty('body.access_token');
    });

    it('wrong should return 401 unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/register')
        .send({
          name: 'test user',
          email: 'testuser@email.com',
          password: 'password123',
          password2: 'password123',
        })
        .expect(201);

      await request(app.getHttpServer())
        .post('/login')
        .send({
          username: 'testuser@email.com',
          password: 'password122',
        })
        .expect(401);
    });
  });
});
