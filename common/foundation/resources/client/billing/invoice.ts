import {Subscription} from './subscription';

export interface Invoice {
  id: string;
  notes: string;
  subscription_id: number;
  subscription: Subscription;
  uuid: string;
  status: 'paid' | 'draft';
  amount_paid?: number; // in cents
  currency?: string;
  created_at: string;
}
