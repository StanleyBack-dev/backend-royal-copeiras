import { SetMetadata } from "@nestjs/common";
import { PageAccessKey } from "../enums/page-access-key.enum";

export const PAGE_ACCESS_KEY = "pageAccessKey";
export const RequirePageAccess = (page: PageAccessKey) =>
  SetMetadata(PAGE_ACCESS_KEY, page);
