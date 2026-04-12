import { UpdateCustomersInputDto } from '../../dtos/update/update-customers-input.dto';

describe('UpdateCustomersInputDto', () => {
  it('should require idCustomers', () => {
    const input = new UpdateCustomersInputDto();
    expect(input.idCustomers).toBeUndefined();
  });

  it('should allow partial update', () => {
    const input = new UpdateCustomersInputDto();
    input.idCustomers = 'uuid-mock';
    input.name = 'Novo Nome';
    expect(input.idCustomers).toBe('uuid-mock');
    expect(input.name).toBe('Novo Nome');
  });
});