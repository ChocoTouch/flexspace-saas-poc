import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { QrService } from './qr.service';
import { VerifyQRDto } from './dto/verify-qr.dto';
import { Public, Roles } from '../auth/decorators';

@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  /**
   * GET /api/qr/generate/:reservationId
   * Générer un QR Code pour une réservation
   */
  @Get('generate/:reservationId')
  async generateQRCode(
    @Param('reservationId', ParseUUIDPipe) reservationId: string,
    // @CurrentUser('id') userId: string,
  ) {
    // TODO: Vérifier que l'utilisateur est propriétaire ou admin
    return this.qrService.generateQRCode(reservationId);
  }

  /**
   * POST /api/qr/verify
   * Vérifier la validité d'un QR Code (simulation scanner)
   * Public endpoint (ou protégé par API key en production)
   */
  @Public()
  @Post('verify')
  async verifyQRCode(@Body() verifyQRDto: VerifyQRDto) {
    return this.qrService.verifyQRCode(verifyQRDto.qrData);
  }

  /**
   * GET /api/qr/access-logs/:reservationId
   * Récupérer les logs d'accès d'une réservation
   */
  @Get('access-logs/:reservationId')
  @Roles('ADMIN', 'MANAGER')
  async getAccessLogs(@Param('reservationId', ParseUUIDPipe) reservationId: string) {
    return this.qrService.getAccessLogs(reservationId);
  }
}
