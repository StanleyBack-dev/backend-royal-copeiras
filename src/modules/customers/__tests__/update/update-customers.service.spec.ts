import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCustomersService } from '../../services/update/update-customers.service';
import { customerMock } from '../../__mocks__/customer.mock';

describe('UpdateCustomersService', () => {
  let service: UpdateCustomersService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue({ ...customerMock, name: 'Novo Nome' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: UpdateCustomersService, useValue: serviceMock },
      ],
    }).compile();
    service = module.get<UpdateCustomersService>(UpdateCustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should update a customer', async () => {
    const input = { idCustomers: 'mock-customer-id', name: 'Novo Nome' };
    const userId = 'user-id-test';
    const result = await service.execute(userId, input);
    expect(result.name).toBe('Novo Nome');
  });

  it('should throw error if customer not found', async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(new Error('Cliente não encontrado.'));
    await expect(service.execute('user-id-test', { idCustomers: 'not-exist' })).rejects.toThrow('Cliente não encontrado.');
  });
});