import { registerEnumType } from "@nestjs/graphql";

export enum PaymentStatus {
  PENDING = "pendente",
  PARTIAL = "parcial",
  PAID = "pago",
  CANCELED = "cancelado",
}

registerEnumType(PaymentStatus, {
  name: "PaymentStatus",
  description: "Status de pagamento",
});
