import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCustomersService } from '../../services/update/update-customers.service';
import { UpdateCustomersResolver } from '../../resolvers/update/update-customers.resolver';

describe('UpdateCustomersResolver', () => {
  let resolver: UpdateCustomersResolver;
  let service: UpdateCustomersService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomersResolver,
        { provide: UpdateCustomersService, useValue: serviceMock },
      ],
    }).compile();
    resolver = module.get<UpdateCustomersResolver>(UpdateCustomersResolver);
    service = module.get<UpdateCustomersService>(UpdateCustomersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
    expect(service).toBeDefined();
  });

  // Adicione mais cenários de mutation conforme necessário
});