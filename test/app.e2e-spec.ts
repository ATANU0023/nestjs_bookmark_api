import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';


describe('App e2e', () => {

  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    app.close();
  });

  const dto: AuthDto = {
    email: 'Jpj2A@example.com',
    password: '123',
  }
  describe('Auth', () => {
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);

      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);

      });
      it('should throw if nothing provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);

      });
      
      it('should signup user', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);

      });
    });

    describe('Signin', () => {

      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);

      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);

      });
      it('should throw if nothing provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);

      });
      it('should signin user',()=>{
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody(dto)
        .expectStatus(200)
        .stores('userAt','access_token');
      });

    });
  });


  describe('User', () => {
    describe('Get current user', () => {

      it('should get current user', () => {
        return pactum
        .spec()
        .get('/users/me')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200);
      });
    });

    describe('Edit user', () => {

      it('should Edit user', () => {

        const dto: EditUserDto = {
          firstName: "test1",
          email: "Jpj2A@example.com",
        }
        return pactum
        .spec()
        .patch('/users')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmark', () => {
    describe('Get empty bookmarks', () => {

      it('should get bookmarks',()=>{
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBody([]);
      });
    });

    describe('Create bookmark', () => {

      const dto: CreateBookmarkDto = {
        title: "FIRST bookmark",
        link: "https://www.google.com",
      }

      it('should create bookmarks',()=>{
        return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(201)
        .stores('bookmarkId','id');
      });
    });

    describe('Get bookmark', () => {
      
      it('should get bookmarks',()=>{
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(1);
      });
    })
    

    describe('Get bookmark by id', () => {

      it('should get bookmarks by id',()=>{
        return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {

      const dto: EditBookmarkDto = {
        title: "test title",
        description : "test description",
      }
      it('should edit bookmarks by id',()=>{
        return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.title)
        .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {

      it('should delete bookmarks by id',()=>{
        return pactum
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(204)
      });

      it('should get empty bookmarks',()=>{

        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(200)
        .expectJsonLength(0);
      })
    });
    
  });
});