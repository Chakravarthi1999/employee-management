import { Visibility } from '@prisma/client';

export class UpdateBannerDto {
  id: number;
  visibility?: Visibility;
  orderIndex?: number;
}
