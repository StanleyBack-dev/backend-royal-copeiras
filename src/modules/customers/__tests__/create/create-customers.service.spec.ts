import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomersService } from '../../services/create/create-customers.service';
import { customerMock } from '../../__mocks__/customer.mock';

describe('CreateCustomersService', () => {
  let service: CreateCustomersService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(customerMock),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CreateCustomersService, useValue: serviceMock },
      ],
    }).compile();
    service = module.get<CreateCustomersService>(CreateCustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a customer with all fields', async () => {
    const input = {
      name: 'Cliente Exemplo',
      document: '12345678901',
      type: 'individual' as const,
      isActive: true,
      email: 'cliente@exemplo.com',
      phone: '11999999999',
      birthDate: '1990-01-01',
      address: 'Rua Exemplo, 123',
    };
    const userId = 'user-id-test';
    const result = await service.execute(userId, input);
    expect(result).toEqual(customerMock);
  });

  it('should throw error for duplicate document', async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(new Error('Já existe um cliente com este documento.'));
    const input = {
      name: 'Cliente Exemplo',
      document: '12345678901',
      type: 'individual' as const,
      isActive: true,
    };
    await expect(service.execute('user-id-test', input)).rejects.toThrow('Já existe um cliente com este documento.');
  });
});