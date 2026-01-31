import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyQRDto {
  @IsString()
  @IsNotEmpty()
  qrData: string; // Base64 encoded QR data
}
