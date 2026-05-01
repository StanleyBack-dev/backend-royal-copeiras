import { Query, Resolver } from "@nestjs/graphql";
import { ALL_PAGE_ACCESS_KEYS } from "../enums/page-access-key.enum";
import { GROUP_DEFAULT_PAGE_ACCESS } from "../constants/group-page-access.constant";
import { PageAccessMetadataResponseDto } from "../dtos/page-access-metadata-response.dto";
import { UserGroup } from "../../users/enums/user-group.enum";

@Resolver()
export class PageAccessMetadataResolver {
  @Query(() => PageAccessMetadataResponseDto, {
    name: "getPageAccessMetadata",
  })
  getPageAccessMetadata(): PageAccessMetadataResponseDto {
    const groupDefaults = Object.entries(GROUP_DEFAULT_PAGE_ACCESS).map(
      ([group, defaultPermissions]) => ({
        group: group as UserGroup,
        defaultPermissions,
      }),
    );

    return {
      allKeys: ALL_PAGE_ACCESS_KEYS,
      groupDefaults,
    };
  }
}
