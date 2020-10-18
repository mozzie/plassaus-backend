import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import AppModule from '../src/app.module';
import tables from './dbtruncate.helper';
import ExceptionFilter from '../src/exception.filter';

describe('EventController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let otherAccessToken: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new ExceptionFilter());
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

    await request(app.getHttpServer())
      .post('/register')
      .send({
        name: 'other user',
        email: 'other@email.com',
        password: 'password123',
        password2: 'password123',
      })
      .expect(201);
    const otherRes = await request(app.getHttpServer())
      .post('/login')
      .send({
        username: 'other@email.com',
        password: 'password123',
      })
      .expect(201);
    otherAccessToken = otherRes.body.access_token;
  });

  afterEach(async () => {
    const connection = getConnection();
    /* eslint-disable-next-line no-restricted-syntax */
    for (const table of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await connection.query(`delete from ${table}`);
    }
  });

  describe('/events (POST)', () => {
    it('valid event should be saved to database', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test_event',
        })
        .expect(201);
    });

    it('valid event without access token should return 401', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .send({
          name: 'test_event',
        })
        .expect(401);
    });

    it('event without a name should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
        })
        .expect(400);
    });

    it('event with a short name should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'bl',
        })
        .expect(400);
    });

    it('event with a long name should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'a'.repeat(101),
        })
        .expect(400);
    });
  });

  describe('/events/:id (GET)', () => {
    let eventId;
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test_event',
        })
        .expect(201);
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(res.body.length === 1);
      eventId = res.body[0].id;
    });

    it('Event should be found from database', async () => {
      await request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
    });

    it('Event should note be found from database with a wrong user', async () => {
      await request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` })
        .expect(404);
    });
  });

  describe('/events/:id (PUT)', () => {
    let eventId;
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test_event',
        })
        .expect(201);
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(res.body.length === 1);
      eventId = res.body[0].id;
    });

    it('event name should be updated with valid input', async () => {
      const beforeUpdate = await request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(beforeUpdate.body.name).toEqual('test_event');

      await request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'new_name',
        })
        .expect(200);

      const afterUpdate = await request(app.getHttpServer())
        .get(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(afterUpdate.body.name).toEqual('new_name');
    });

    it('too short event name should return 400', async () => {
      await request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'nn',
        })
        .expect(400);
    });

    it('too long event name should return 400', async () => {
      await request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'a'.repeat(101),
        })
        .expect(400);
    });
    it('update with wrong user should return 401', async () => {
      await request(app.getHttpServer())
        .put(`/events/${eventId}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` })
        .send({
          name: 'new_name',
        })
        .expect(404);
    });
  });
  describe('/events (GET)', () => {
    beforeEach(async () => {
      for (let i = 0; i < 25; i++) {
        await request(app.getHttpServer())
          .post('/events')
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({
            name: `test event nr.${i}`,
          })
          .expect(201);
      }
    });

    it('should default to page 0', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          pageSize: 5,
          sortBy: 'name',
          sortOrder: 'ASC',
        })
        .expect(200);
      const events = res.body;
      expect(events.map((event) => event.name)).toEqual([
        'test event nr.0',
        'test event nr.1',
        'test event nr.10',
        'test event nr.11',
        'test event nr.12',
      ]);
    });

    it('should treat negative page as page 0', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          pageSize: 5,
          page: -10,
          sortBy: 'name',
          sortOrder: 'ASC',
        })
        .expect(200);
      const events = res.body;
      expect(events.map((event) => event.name)).toEqual([
        'test event nr.0',
        'test event nr.1',
        'test event nr.10',
        'test event nr.11',
        'test event nr.12',
      ]);
    });

    it('paging should work', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          pageSize: 5,
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 1,
        })
        .expect(200);
      const events = res.body;
      expect(events.map((event) => event.name)).toEqual([
        'test event nr.13',
        'test event nr.14',
        'test event nr.15',
        'test event nr.16',
        'test event nr.17',
      ]);
    });

    it('default pageSize should be 20', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 0,
        })
        .expect(200);
      const events = res.body;
      expect(events.length).toEqual(20);
    });

    it('maximum pageSize should be 20', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 0,
          pageSize: 25,
        })
        .expect(200);
      const events = res.body;
      expect(events.length).toEqual(20);
    });

    it('minimum pageSize should be 1', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 0,
          pageSize: 0,
        })
        .expect(200);
      const events = res.body;
      expect(events.length).toEqual(1);
    });

    it('default sort column should be ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortOrder: 'ASC',
          page: 0,
          pageSize: 5,
        })
        .expect(200);
      const events = res.body;
      expect(events.map((event) => event.name)).toEqual([
        'test event nr.0',
        'test event nr.1',
        'test event nr.2',
        'test event nr.3',
        'test event nr.4',
      ]);
    });

    it('default sort order should be ASC', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'id',
          page: 0,
          pageSize: 5,
        })
        .expect(200);
      const events = res.body;
      expect(events.map((event) => event.name)).toEqual([
        'test event nr.0',
        'test event nr.1',
        'test event nr.2',
        'test event nr.3',
        'test event nr.4',
      ]);
    });

    it('sorting by DESC should work', async () => {
      const res = await request(app.getHttpServer())
        .get('/events')
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortOrder: 'DESC',
          sortBy: 'id',
          page: 0,
          pageSize: 5,
        })
        .expect(200);
      const events = res.body;
      expect(events.map((event) => event.name)).toEqual([
        'test event nr.24',
        'test event nr.23',
        'test event nr.22',
        'test event nr.21',
        'test event nr.20',
      ]);
    });
  });
});
