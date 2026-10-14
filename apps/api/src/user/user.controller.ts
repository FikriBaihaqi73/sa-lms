import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ResponseHelper } from "@repo/shared/http/response";
import { CreateUserDto, UpdateUserDto } from "@repo/shared/schemas/user.schema";
import type { Request } from "express";
import { ZodValidationPipe } from "nestjs-zod";
import { Roles } from "../auth/roles.decorator";
import { UserService } from "./user.service";

@ApiTags("Users")
@ApiBearerAuth("JWT-auth")
// User management is restricted to platform owners (superadmin, who can see
// every institution) and institution admins (who are scoped to their own
// institution by the service). Other roles are rejected by the RolesGuard.
@Roles("superadmin", "admin")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: "Get users with search and pagination" })
  async findAll(
    @Req() request: Request & { user: { sub: string } },
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("search") search?: string,
  ) {
    const users = await this.userService.findAll(
      page,
      limit,
      search,
      request.user.sub,
    );
    return ResponseHelper.success(users, "Users retrieved successfully");
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  async findOne(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const user = await this.userService.findOne(id, request.user.sub);
    return ResponseHelper.success(user, "User detail retrieved successfully");
  }

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  async create(
    @Body(new ZodValidationPipe()) dto: CreateUserDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const user = await this.userService.create(dto, request.user.sub);
    return ResponseHelper.success(user, "User created successfully", 201);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing user" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) dto: UpdateUserDto,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const user = await this.userService.update(id, dto, request.user.sub);
    return ResponseHelper.success(user, "User updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  async remove(
    @Param("id") id: string,
    @Req() request: Request & { user: { sub: string } },
  ) {
    const result = await this.userService.remove(id, request.user.sub);
    return ResponseHelper.success(result, "User deleted successfully");
  }
}
