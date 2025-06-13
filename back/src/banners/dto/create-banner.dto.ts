import { Visibility } from '@prisma/client';

export class CreateBannerDto {
  filename: string;
  visibility?: Visibility;
  orderIndex?: number;
}
