import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import nock from 'nock';

describe('ProxyAuth (e2e)', () => {
  let app: INestApplication<App>;
  const externalAuthBaseUrl = 'http://localhost:3000/auth';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // Clear any previous nock mocks
    nock.cleanAll();
  });

  afterEach(async () => {
    await app.close();
    nock.cleanAll();
  });

  describe('POST /proxy/auth/signup', () => {
    it('should forward signup request to external auth API', async () => {
      const signupPayload = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const externalResponse = {
        message: 'Signup successful. Please verify your email with the OTP sent.',
        email: 'test@example.com',
      };

      // Stub the external auth API at the correct endpoint
      nock('http://localhost:3000')
        .post('/auth/signup')
        .reply(200, externalResponse);

      // Call the proxy endpoint and expect response
      const response = await request(app.getHttpServer())
        .post('/proxy/auth/signup')
        .send(signupPayload);

      // Assert response forwarding: should get 200 and the response body
      expect([200, 201]).toContain(response.status); // Accept both 200 and 201
      expect(response.body).toEqual(externalResponse);
    });
  });

  describe('GET /proxy/auth/signup', () => {
    it('should return usage instructions', async () => {
      const response = await request(app.getHttpServer())
        .get('/proxy/auth/signup')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('exampleBody');
      expect(response.body.message).toContain('POST');
    });
  });

  describe('POST /proxy/auth/signin', () => {
    it('should forward signin request to external auth API', async () => {
      const signinPayload = {
        email: 'test@example.com',
        password: 'password123',
      };

      const externalResponse = {
        access_token: 'jwt_token_here',
        user: {
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
        },
      };

      nock('http://localhost:3000')
        .post('/auth/signin')
        .reply(200, externalResponse);

      const response = await request(app.getHttpServer())
        .post('/proxy/auth/signin')
        .send(signinPayload);

      // Assert proxy forwards the request and response
      expect([200, 201]).toContain(response.status);
      expect(response.body).toEqual(externalResponse);
    });
  });
});
