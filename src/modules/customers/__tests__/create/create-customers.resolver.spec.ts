import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomersService } from '../../services/create/create-customers.service';
import { CreateCustomersResolver } from '../../resolvers/create/create-customers.resolver';

describe('CreateCustomersResolver', () => {
  let resolver: CreateCustomersResolver;
  let service: CreateCustomersService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomersResolver,
        { provide: CreateCustomersService, useValue: serviceMock },
      ],
    }).compile();
    resolver = module.get<CreateCustomersResolver>(CreateCustomersResolver);
    service = module.get<CreateCustomersService>(CreateCustomersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });
});