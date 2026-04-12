import { Test, TestingModule } from '@nestjs/testing';
import { GetCustomersService } from '../../services/get/get-customers.service';
import { GetCustomersResolver } from '../../resolvers/get/get-customers.resolver';

describe('GetCustomersResolver', () => {
  let resolver: GetCustomersResolver;
  let service: GetCustomersService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomersResolver,
        { provide: GetCustomersService, useValue: serviceMock },
      ],
    }).compile();
    resolver = module.get<GetCustomersResolver>(GetCustomersResolver);
    service = module.get<GetCustomersService>(GetCustomersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });

  // Adicione mais cenários de query conforme necessário
});