import { IsEnum, IsUUID } from 'class-validator';
import { VoteType, TargetType } from '../../entities/vote.entity';

export class VoteDto {
  @IsUUID(4, { message: 'ID đối tượng không hợp lệ' })
  target_id: string;

  @IsEnum(TargetType, { message: 'Loại đối tượng không hợp lệ' })
  target_type: TargetType;

  @IsEnum(VoteType, { message: 'Loại vote không hợp lệ' })
  vote_type: VoteType;
} 