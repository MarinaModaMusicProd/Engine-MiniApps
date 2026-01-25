import {Invoice} from '@common/billing/invoice';
import {Subscription} from '@common/billing/subscription';
import {Required} from 'utility-types';

export type BillingPageUserResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    image: string;
    card_brand: string;
    card_last_four: string;
    card_expires: string;
  };
  subscription: Required<Subscription, 'product' | 'price' | 'on_trial'>;
  invoices: Invoice[];
};
