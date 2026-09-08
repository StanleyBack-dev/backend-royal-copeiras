import { dbLocalNow } from "../../../common/utils/to-db-local-timestamp.util";
import { PublicIntakeCodeEntity } from "../entities/public-intake-code.entity";
import { PublicIntakeCodeStatus } from "../enums/public-intake-code-status.enum";

/**
 * The code's lifecycle is fully described by its timestamps; there is no
 * separate persisted status column to keep in sync with them. "now" must
 * be built via dbLocalNow (see to-db-local-timestamp.util) so it's
 * comparable against these naive-column values regardless of which OS
 * timezone this process happens to run under — a raw Date.now() is not.
 */
export function derivePublicIntakeCodeStatus(
  entity: PublicIntakeCodeEntity,
): PublicIntakeCodeStatus {
  const now = dbLocalNow().getTime();

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
