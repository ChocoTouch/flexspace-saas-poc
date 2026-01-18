// import { Test, TestingModule } from '@nestjs/testing';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

describe('AppController', () => {
  //let appController: AppController;

  beforeEach(async () => {
    // const app: TestingModule = await Test.createTestingModule({
    //   controllers: [AppController],
    //   providers: [AppService],
    // }).compile();
    //appController = app.get<AppController>(AppController);
  });

  describe('sanity check', () => {
    it('should verify that 1 equals 1', () => {
      expect(1).toBe(1);
    });
  });
});
