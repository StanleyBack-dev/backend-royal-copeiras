import { Module } from "@nestjs/common";
import { PdfGeneratorService } from "./services/pdf-generator.service";
import { PdfTemplateResolverService } from "./services/pdf-template-resolver.service";
import { PdfSnapshotHashService } from "./services/pdf-snapshot-hash.service";

@Module({
  providers: [
    PdfGeneratorService,
    PdfTemplateResolverService,
    PdfSnapshotHashService,
  ],
  exports: [
    PdfGeneratorService,
    PdfTemplateResolverService,
    PdfSnapshotHashService,
  ],
})
export class PdfGeneratorModule {}
