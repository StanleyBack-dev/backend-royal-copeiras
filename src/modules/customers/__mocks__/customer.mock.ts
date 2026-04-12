import { CustomersEntity } from '../entities/customers.entity';
import { UserEntity } from '../../users/entities/user.entity';

export const customerMock: CustomersEntity = {
  idCustomers: 'mock-customer-id',
  idUsers: 'mock-user-id',
  user: { idUsers: 'mock-user-id' } as UserEntity,
  name: 'Cliente Exemplo',
  document: '12345678901',
  type: 'individual',
  email: 'cliente@exemplo.com',
  phone: '11999999999',
  birthDate: '1990-01-01',
  address: 'Rua Exemplo, 123',
  isActive: true,
  createdAt: new Date('2024-04-12T00:00:00Z'),
  updatedAt: new Date('2024-04-12T00:00:00Z'),
};
