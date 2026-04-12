import { GetCustomersInputDto } from '../../dtos/get/get-customers-input.dto';

describe('GetCustomersInputDto', () => {
  it('should allow empty input', () => {
    const input = new GetCustomersInputDto();
    expect(input).toBeDefined();
  });

  it('should validate optional fields', () => {
    const input = new GetCustomersInputDto();
    input.idCustomers = 'uuid-mock';
    input.startDate = '2024-01-01';
    input.endDate = '2024-12-31';
    expect(input.idCustomers).toBe('uuid-mock');
    expect(input.startDate).toBe('2024-01-01');
    expect(input.endDate).toBe('2024-12-31');
  });
});