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
import {
  CreateProfileDto,
  UpdateProfileDto,
} from "@repo/shared/schemas/profile.schema";
import { ZodValidationPipe } from "nestjs-zod";
import { ProfileService } from "./profile.service";

@ApiTags("Profiles")
@ApiBearerAuth("JWT-auth")
@Controller("profiles")
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: "Get profiles with search and pagination" })
  async findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("search") search?: string,
  ) {
    const profiles = await this.profileService.findAll(page, limit, search);
    return ResponseHelper.success(profiles, "Profiles retrieved successfully");
  }

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  async getMyProfile(@Req() req: { user?: { sub: string } }) {
    const userId = req.user?.sub;
    if (!userId) {
      return ResponseHelper.error("Unauthorized user", 401);
    }
    const profile = await this.profileService.findByUserId(userId);
    return ResponseHelper.success(
      profile,
      "Current profile retrieved successfully",
    );
  }

  @Patch("me")
  @ApiOperation({ summary: "Update current user profile" })
  async updateMyProfile(
    @Req() req: { user?: { sub: string } },
    @Body(new ZodValidationPipe()) updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user?.sub;
    if (!userId) {
      return ResponseHelper.error("Unauthorized user", 401);
    }
    const profile = await this.profileService.findByUserId(userId);
    if (!profile) {
      return ResponseHelper.error("Profile not found", 404);
    }
    const updated = await this.profileService.update(profile.id, updateProfileDto);
    return ResponseHelper.success(updated, "Profile updated successfully");
  }

  @Get(":id")
  @ApiOperation({ summary: "Get profile by ID" })
  async findOne(@Param("id") id: string) {
    const profile = await this.profileService.findOne(id);
    return ResponseHelper.success(
      profile,
      "Profile detail retrieved successfully",
    );
  }

  @Post()
  @ApiOperation({ summary: "Create a new profile" })
  async create(
    @Body(new ZodValidationPipe()) createProfileDto: CreateProfileDto,
  ) {
    const profile = await this.profileService.create(createProfileDto);
    return ResponseHelper.success(profile, "Profile created successfully", 201);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an existing profile" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe()) updateProfileDto: UpdateProfileDto,
  ) {
    const profile = await this.profileService.update(id, updateProfileDto);
    return ResponseHelper.success(profile, "Profile updated successfully");
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a profile" })
  async remove(@Param("id") id: string) {
    const result = await this.profileService.remove(id);
    return ResponseHelper.success(result, "Profile deleted successfully");
  }
}
