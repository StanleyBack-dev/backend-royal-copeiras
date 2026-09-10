import { PublicIntakeCodeEntity } from "../entities/public-intake-code.entity";
import { PublicIntakeCodeStatus } from "../enums/public-intake-code-status.enum";

/**
 * The code's lifecycle is fully described by its timestamps; there is no
 * separate persisted status column to keep in sync with them. Expiry is
 * compared against `Date.now()`, matching how the rest of the project checks
 * token/code expiry (sessions, password-recovery).
 */
export function derivePublicIntakeCodeStatus(
  entity: PublicIntakeCodeEntity,
): PublicIntakeCodeStatus {
  const now = Date.now();

  if (entity.invalidatedAt) {
    return PublicIntakeCodeStatus.INVALIDATED;
  }

  if (entity.consumedAt) {
    return PublicIntakeCodeStatus.SUBMITTED;
  }

  if (entity.verifiedAt) {
    const formExpired =
      !entity.formTokenExpiresAt ||
      new Date(entity.formTokenExpiresAt).getTime() < now;
    return formExpired
      ? PublicIntakeCodeStatus.EXPIRED
      : PublicIntakeCodeStatus.VERIFIED;
  }

  const codeExpired = new Date(entity.expiresAt).getTime() < now;
  return codeExpired
    ? PublicIntakeCodeStatus.EXPIRED
    : PublicIntakeCodeStatus.PENDING;
}
