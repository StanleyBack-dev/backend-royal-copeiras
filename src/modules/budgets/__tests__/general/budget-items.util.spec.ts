import { SuppliesEntity } from "../../../supplies/entities/supplies.entity";
import { BudgetItemType } from "../../enums/budget-item-type.enum";
import { normalizeBudgetItems } from "../../validators/base/budget-items.util";

function makeSupply(overrides: Partial<SuppliesEntity>): SuppliesEntity {
  return {
    idSupplies: "supply-1",
    name: "Papel higiênico",
    normalizedName: "papel higienico",
    defaultUnit: "rolo",
    suggestedUnitPrice: 12.9,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as SuppliesEntity;
}

describe("normalizeBudgetItems", () => {
  it("takes the unit and name from the linked supply, keeps the posted price", () => {
    const suppliesById = new Map<string, SuppliesEntity>([
      ["supply-1", makeSupply({ idSupplies: "supply-1" })],
    ]);

    const [item] = normalizeBudgetItems(
      [
        {
          itemType: BudgetItemType.SUPPLY,
          idSupplies: "supply-1",
          // client tried to send its own unit / name / price
          unit: "caixa",
          description: "material qualquer",
          quantity: 3,
          unitPrice: 20,
          eventDateIndex: 0,
        },
      ],
      suppliesById,
    );

    expect(item.unit).toBe("rolo");
    expect(item.description).toBe("Papel higiênico");
    expect(item.unitPrice).toBe(20);
    expect(item.totalPrice).toBe(60);
  });

  it("leaves LABOR items untouched", () => {
    const [item] = normalizeBudgetItems(
      [
        {
          itemType: BudgetItemType.LABOR,
          idPositions: "pos-1",
          description: "2 copeiras",
          quantity: 2,
          unitPrice: 500,
          eventDateIndex: 0,
        },
      ],
      new Map(),
    );

    expect(item.itemType).toBe(BudgetItemType.LABOR);
    expect(item.idPositions).toBe("pos-1");
    expect(item.unit).toBeNull();
  });
});
