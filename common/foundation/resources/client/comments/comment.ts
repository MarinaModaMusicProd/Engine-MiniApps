import {VotableModel} from '@common/votes/votable-model';
import {NormalizedModel} from '@ui/types/normalized-model';

export interface Comment extends VotableModel {
  content: string;
  user_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    image: string | null;
  };
  depth: number;
  deleted: boolean;
  commentable?: NormalizedModel;
  position?: number;
  created_at?: string;
}
