import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getConnection } from 'typeorm';
import AppModule from '../src/app.module';
import tables from './dbtruncate.helper';
import ExceptionFilter from '../src/exception.filter';

describe('GuestController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let otherAccessToken: string;
  let eventId: number;
  let otherEventId: number;

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

    await request(app.getHttpServer())
      .post('/events')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send({
        name: 'test_event',
      })
      .expect(201);
    const eventResponse = await request(app.getHttpServer())
      .get('/events')
      .set({ Authorization: `Bearer ${accessToken}` })
      .expect(200);
    expect(eventResponse.body.length === 1);
    eventId = eventResponse.body[0].id;

    await request(app.getHttpServer())
      .post('/events')
      .set({ Authorization: `Bearer ${otherAccessToken}` })
      .send({
        name: 'other_event',
      })
      .expect(201);
    const otherEventResponse = await request(app.getHttpServer())
      .get('/events')
      .set({ Authorization: `Bearer ${otherAccessToken}` })
      .expect(200);
    expect(otherEventResponse.body.length === 1);
    otherEventId = otherEventResponse.body[0].id;
  });

  afterEach(async () => {
    const connection = getConnection();
    /* eslint-disable-next-line no-restricted-syntax */
    for (const table of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await connection.query(`delete from ${table}`);
    }
  });



  describe('/events/:id/guests (POST)', () => {
    it('valid event guest should be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test guest',
        })
        .expect(201);
    });

    it('valid event guest without access token should return 401', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .send({
          name: 'test guest',
        })
        .expect(401);
    });

    it('guest without a name should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
        })
        .expect(400);
    });

    it('guest with a short name should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'bl',
        })
        .expect(400);
    });

    it('guest with a long name should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'a'.repeat(101),
        })
        .expect(400);
    });

    it('saving to another users event should return 404', async () => {
      await request(app.getHttpServer())
        .post(`/events/${otherEventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test person',
        })
        .expect(404);
    });
  });

  describe('/events/:id/guests/batch (POST)', () => {
    it('valid event guest should be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests/batch`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({guests: [
          { name: 'test guest' },
          { name: 'another guest' },
          { name: 'third guest' },
        ]})
        .expect(201);
    });

    it('valid event guest without access token should return 401', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests/batch`)
        .send({guests: [
          { name: 'test guest' },
        ]})
        .expect(401);
    });

    it('guest without a name in a list should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests/batch`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({guests: [
          { name: 'test guest' },
          {}
        ]})
        .expect(400);
    });

    it('guest with a short name in a list should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests/batch`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({guests: [
          { name: 'test guest' },
          { name: 'bl' },
        ]})
        .expect(400);
    });

    it('guest with a long name should not be saved to database', async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests/batch`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({guests: [
          { name: 'test guest' },
          { name: 'a'.repeat(101)},
        ]})
        .expect(400);
    });

    it('batch saving to another users event should return 404', async () => {
      await request(app.getHttpServer())
        .post(`/events/${otherEventId}/guests/batch`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({guests: [
          { name: 'test person'}
        ]})
        .expect(404);
    });

  });


   describe('/events/:eventId/guests/:id (GET)', () => {
    let guestId;
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test user',
        })
        .expect(201);
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(res.body.length === 1);
      guestId = res.body[0].id;
    });

    it('Event guest should be found from database', async () => {
      await request(app.getHttpServer())
        .get(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
    });

    it('Event guest should not be found under the wrong event', async () => {
      await request(app.getHttpServer())
        .get(`/events/${otherEventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(404);
    });

    it('Event guest should not be found with the wrong credentials', async () => {
      await request(app.getHttpServer())
        .get(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` })
        .expect(404);
    });

  });

  describe('/events/:eventId/guests/:guestId   (PUT)', () => {
    let guestId;
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test person',
        })
        .expect(201);
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(res.body.length === 1);
      guestId = res.body[0].id;
    });

    it('event name should be updated with valid input', async () => {
      const beforeUpdate = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(beforeUpdate.body.name).toEqual('test person');

      await request(app.getHttpServer())
        .put(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'new name',
        })
        .expect(200);

      const afterUpdate = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(afterUpdate.body.name).toEqual('new name');
    });

    it('too short guest name should return 400', async () => {
      await request(app.getHttpServer())
        .put(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'nn',
        })
        .expect(400);
    });

    it('too long guest name should return 400', async () => {
      await request(app.getHttpServer())
        .put(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'a'.repeat(101),
        })
        .expect(400);
    });
    it('update with wrong user should return 401', async () => {
      await request(app.getHttpServer())
        .put(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` })
        .send({
          name: 'new_name',
        })
        .expect(404);
    });
    it('update with wrong event should return 401', async () => {
      await request(app.getHttpServer())
        .put(`/events/${otherEventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` })
        .send({
          name: 'new_name',
        })
        .expect(404);
    });
    it('update with nonexistant guestId should return 401', async () => {
      await request(app.getHttpServer())
        .put(`/events/${eventId}/guests/${guestId+2}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'new_name',
        })
        .expect(404);
    });

  });

  describe('/events/:id/guests (GET)', () => {
    beforeEach(async () => {
      for (let i = 0; i < 25; i++) {
        await request(app.getHttpServer())
          .post(`/events/${eventId}/guests`)
          .set({ Authorization: `Bearer ${accessToken}` })
          .send({
            name: `test guest nr.${i}`,
          })
          .expect(201);
      }
    });

    it('should default to page 0', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          pageSize: 5,
          sortBy: 'name',
          sortOrder: 'ASC',
        })
        .expect(200);
      const guests = res.body;
      expect(guests.map((guest) => guest.name)).toEqual([
        'test guest nr.0',
        'test guest nr.1',
        'test guest nr.10',
        'test guest nr.11',
        'test guest nr.12',
      ]);
    });

    it('should treat negative page as page 0', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          pageSize: 5,
          page: -10,
          sortBy: 'name',
          sortOrder: 'ASC',
        })
        .expect(200);
      const guests = res.body;
      expect(guests.map((guest) => guest.name)).toEqual([
        'test guest nr.0',
        'test guest nr.1',
        'test guest nr.10',
        'test guest nr.11',
        'test guest nr.12',
      ]);
    });

    it('paging should work', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          pageSize: 5,
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 1,
        })
        .expect(200);
      const guests = res.body;
      expect(guests.map((guest) => guest.name)).toEqual([
        'test guest nr.13',
        'test guest nr.14',
        'test guest nr.15',
        'test guest nr.16',
        'test guest nr.17',
      ]);
    });

    it('default pageSize should be 20', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 0,
        })
        .expect(200);
      const guests = res.body;
      expect(guests.length).toEqual(20);
    });

    it('maximum pageSize should be 20', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 0,
          pageSize: 25,
        })
        .expect(200);
      const guests = res.body;
      expect(guests.length).toEqual(20);
    });

    it('page size 0 should return all guests', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'name',
          sortOrder: 'ASC',
          page: 0,
          pageSize: 0,
        })
        .expect(200);
      const guests = res.body;
      expect(guests.length).toEqual(25);
    });

    it('default sort column should be ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortOrder: 'ASC',
          page: 0,
          pageSize: 5,
        })
        .expect(200);
      const guests = res.body;
      expect(guests.map((guest) => guest.name)).toEqual([
        'test guest nr.0',
        'test guest nr.1',
        'test guest nr.2',
        'test guest nr.3',
        'test guest nr.4',
      ]);
    });

    it('default sort order should be ASC', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortBy: 'id',
          page: 0,
          pageSize: 5,
        })
        .expect(200);
      const guests = res.body;
      expect(guests.map((guest) => guest.name)).toEqual([
        'test guest nr.0',
        'test guest nr.1',
        'test guest nr.2',
        'test guest nr.3',
        'test guest nr.4',
      ]);
    });

    it('sorting by DESC should work', async () => {
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .query({
          sortOrder: 'DESC',
          sortBy: 'id',
          page: 0,
          pageSize: 5,
        })
        .expect(200);
      const guests = res.body;
      expect(guests.map((guest) => guest.name)).toEqual([
        'test guest nr.24',
        'test guest nr.23',
        'test guest nr.22',
        'test guest nr.21',
        'test guest nr.20',
      ]);
    });
  });

  describe('/event/:eventId/guests/:id (DELETE)', () => {
    let guestId;
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({
          name: 'test guest',
        })
        .expect(201);
      const res = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(res.body.length === 1);
      guestId = res.body[0].id;
    });

    it('valid guest should be deleted from database', async () => {
      const beforeDelete = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(beforeDelete.body.length === 1);

      await request(app.getHttpServer())
        .delete(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);

      const afterDelete = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(afterDelete.body.length === 0);
    });

    it('valid guest should not be deleted with wrong accessToken', async () => {
      const beforeDelete = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(beforeDelete.body.length === 1);

      await request(app.getHttpServer())
        .delete(`/events/${eventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` })
        .expect(404);

      const afterDelete = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(afterDelete.body.length === 1);
    });

    it('valid guest should not be deleted from the wrong event', async () => {
      const beforeDelete = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(beforeDelete.body.length === 1);

      await request(app.getHttpServer())
        .delete(`/events/${otherEventId}/guests/${guestId}`)
        .set({ Authorization: `Bearer ${otherAccessToken}` })
        .expect(404);

      const afterDelete = await request(app.getHttpServer())
        .get(`/events/${eventId}/guests`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .expect(200);
      expect(afterDelete.body.length === 1);
    });

  });
});
