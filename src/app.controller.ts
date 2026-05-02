import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      service: "backend-royal-copeiras",
      status: "ok",
      graphql: "/graphql",
    };
  }
}
