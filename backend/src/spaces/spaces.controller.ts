import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto, UpdateSpaceDto, QuerySpacesDto } from './dto';
import { Roles, Public } from '../auth/decorators';

@Controller('spaces')
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  /**
   * POST /api/spaces
   * Créer un nouvel espace (ADMIN uniquement)
   */
  @Post()
  @Roles('ADMIN')
  create(@Body() createSpaceDto: CreateSpaceDto) {
    return this.spacesService.create(createSpaceDto);
  }

  /**
   * GET /api/spaces
   * Lister tous les espaces (PUBLIC)
   */
  @Public()
  @Get()
  findAll(@Query() query: QuerySpacesDto) {
    return this.spacesService.findAll(query);
  }

  /**
   * GET /api/spaces/:id
   * Récupérer un espace par ID (PUBLIC)
   */
  @Public()
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.spacesService.findOne(id);
  }

  /**
   * GET /api/spaces/:id/statistics
   * Statistiques d'un espace (ADMIN/MANAGER)
   */
  @Get(':id/statistics')
  @Roles('ADMIN', 'MANAGER')
  getStatistics(@Param('id', ParseUUIDPipe) id: string) {
    return this.spacesService.getStatistics(id);
  }

  /**
   * PATCH /api/spaces/:id
   * Mettre à jour un espace (ADMIN uniquement)
   */
  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSpaceDto: UpdateSpaceDto) {
    return this.spacesService.update(id, updateSpaceDto);
  }

  /**
   * DELETE /api/spaces/:id
   * Supprimer un espace (ADMIN uniquement)
   */
  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.spacesService.remove(id);
  }
}
