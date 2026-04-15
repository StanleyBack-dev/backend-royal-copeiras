import { GetEmployeesInputDto } from "../../dtos/get/get-employees-input.dto";

describe("GetEmployeesInputDto", () => {
  it("should allow empty filters", () => {
    const input = new GetEmployeesInputDto();
    expect(input.idEmployees).toBeUndefined();
    expect(input.startDate).toBeUndefined();
    expect(input.endDate).toBeUndefined();
  });

  it("should allow filtering by employee id and dates", () => {
    const input = new GetEmployeesInputDto();
    input.idEmployees = "uuid-mock";
    input.startDate = "2024-01-01";
    input.endDate = "2024-12-31";

    expect(input.idEmployees).toBe("uuid-mock");
    expect(input.startDate).toBe("2024-01-01");
    expect(input.endDate).toBe("2024-12-31");
  });
});
