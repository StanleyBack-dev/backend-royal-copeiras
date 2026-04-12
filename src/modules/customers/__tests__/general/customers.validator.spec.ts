import { CustomersBaseValidator } from '../../validators/base/base-customers.validator';

describe('CustomersBaseValidator', () => {
  it('should validate weight in range', () => {
    expect(() => CustomersBaseValidator.validateRanges(70)).not.toThrow();
    expect(() => CustomersBaseValidator.validateRanges(10)).toThrow();
    expect(() => CustomersBaseValidator.validateRanges(400)).toThrow();
  });

  it('should validate date', () => {
    expect(() => CustomersBaseValidator.validateDate('2024-04-12')).not.toThrow();
    expect(() => CustomersBaseValidator.validateDate('2099-01-01')).toThrow();
    expect(() => CustomersBaseValidator.validateDate('invalid-date')).toThrow();
  });
});