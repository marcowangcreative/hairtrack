/**
 * Hand-written DB types. Generate real types later with:
 *   npx supabase gen types typescript --project-id <ref> > lib/types/db.ts
 */

export type FactoryStatus = 'active' | 'evaluating' | 'paused' | 'archived';
export type SampleStage =
  | 'requested'
  | 'in_production'
  | 'shipping'
  | 'received'
  | 'approved'
  | 'rejected';
export type InvoiceParseStatus = 'pending' | 'parsed' | 'confirmed' | 'failed';
export type WaDirection = 'inbound' | 'outbound';

export interface Factory {
  id: string;
  name: string;
  short: string | null;
  city: string | null;
  country: string | null;
  specialty: string | null;
  status: FactoryStatus;
  whatsapp: string | null;
  alibaba_url: string | null;
  website: string | null;
  contact_name: string | null;
  contact_role: string | null;
  moq: number | null;
  lead_time_days: number | null;
  payment_terms: string | null;
  swatch: string | null;
  notes: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sample {
  id: string;
  factory_id: string | null;
  name: string;
  stage: SampleStage;
  requested_at: string | null;
  eta: string | null;
  received_at: string | null;
  notes: string | null;
  cover_photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaThread {
  id: string;
  factory_id: string | null;
  wa_phone: string;
  name: string | null;
  pinned: boolean;
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
}

export interface WaMessage {
  id: string;
  thread_id: string;
  direction: WaDirection;
  body: string | null;
  media_url: string | null;
  media_type: 'image' | 'document' | 'audio' | null;
  telnyx_id: string | null;
  sent_by: string | null;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
}

export interface Invoice {
  id: string;
  factory_id: string | null;
  file_url: string;
  source: 'upload' | 'email' | 'whatsapp';
  parse_status: InvoiceParseStatus;
  parse_confidence: number | null;
  invoice_number: string | null;
  invoice_date: string | null;
  due_date: string | null;
  currency: string;
  subtotal: number | null;
  shipping: number | null;
  tax: number | null;
  total: number | null;
  payment_terms: string | null;
  raw_extraction: unknown;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  sku: string | null;
  description: string | null;
  qty: number | null;
  unit_price: number | null;
  total: number | null;
  ordinal: number | null;
}

export type PoStatus =
  | 'draft'
  | 'sent'
  | 'confirmed'
  | 'in_production'
  | 'shipped'
  | 'received'
  | 'closed';

export interface Po {
  id: string;
  factory_id: string | null;
  sample_id: string | null;
  status: PoStatus;
  total: number | null;
  currency: string;
  deposit_paid: boolean;
  balance_paid: boolean;
  placed_at: string | null;
  ship_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface SamplePhoto {
  id: string;
  sample_id: string;
  url: string;
  caption: string | null;
  created_at: string;
}
