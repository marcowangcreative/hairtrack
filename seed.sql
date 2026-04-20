-- Hair Track — demo seed
-- Re-runnable. Paste into Supabase SQL editor after schema.sql.
-- Data mirrors prototype/data.jsx so the dashboard lights up immediately.

-- =====================================================
-- FACTORIES
-- =====================================================
insert into factories (id, name, short, city, country, specialty, status, whatsapp, alibaba_url, contact_name, contact_role, moq, lead_time_days, payment_terms, swatch, notes, pinned) values
  ('FAC-018','Qingdao Meilong Hair Industry','Meilong','Qingdao, Shandong','CN','Raw virgin bundles, closures','active','+86 138 1042 7788','meilonghair.alibaba.com','Lin Wei','Sales lead',50,18,'30% T/T, 70% B/L','#1a1512','Primary bundle supplier. Consistent single-donor quality. Slower on custom lace work.',true),
  ('FAC-024','Xuchang Arclight Wigs Co.','Arclight','Xuchang, Henan','CN','HD lace frontals, full wigs','active','+86 159 3722 0411','arclightwigs.alibaba.com','Helen Zhao','Account mgr',30,25,'50/50 T/T','#3d2b1f','Best HD lace source. Strict on MOQ. Ships via SF Express.',true),
  ('FAC-031','Hebei Crownroot Hair Mfg.','Crownroot','Xingtai, Hebei','CN','Clip-ins, tape-ins, ponytails','active','+86 177 0319 2256','crownroot.alibaba.com','Mei Chen','Sales',100,22,'30/70 T/T','#6b4a32','Price-competitive on clip-ins. Packaging needs QC every batch.',false),
  ('FAC-042','Guangzhou Velora Beauty','Velora','Guangzhou, Guangdong','CN','Custom color, balayage, highlights','active','+86 135 8802 9911','velorabeauty.alibaba.com','Ivy Tan','Colorist lead',20,14,'100% T/T upfront','#9a6b3f','Color matching is excellent. Worth the premium for signature shades.',true),
  ('FAC-055','Yiwu Silkbridge Exports','Silkbridge','Yiwu, Zhejiang','CN','Packaging, boxes, silk pouches','active','+86 189 5710 6633','silkbridgepack.alibaba.com','Rachel Gu','Export mgr',500,12,'30/70 T/T','#c89968','Soft-touch boxes, gold foil stamping. Color proof turnaround = 4 days.',false),
  ('FAC-063','Chennai Kalpana Tresses','Kalpana','Chennai, Tamil Nadu','IN','Temple hair, raw Indian bundles','evaluating','+91 98404 22117','kalpanatresses.alibaba.com','Priya Ramanathan','Founder',40,28,'40/60 T/T','#d4a574','Authentic temple hair. Lead times slip — build in buffer.',false),
  ('FAC-071','Shenzhen Haloworks Labs','Haloworks','Shenzhen, Guangdong','CN','Lace wig prototypes, R&D','active','+86 186 6630 2087','haloworks.alibaba.com','Kevin Xu','R&D lead',10,10,'Per-unit, net 15','#e8d3a8','Sampling partner of record. Fast iteration, higher per-unit cost.',true)
on conflict (id) do nothing;

-- =====================================================
-- SAMPLES (prototype's "shipped" → schema "shipping")
-- =====================================================
insert into samples (id, factory_id, name, stage, requested_at, eta, notes) values
  ('S-104','FAC-018','20" Raw SE Asian bundle, natural 1B','approved','2026-04-02','2026-04-28','Final batch selected for launch tier 1.'),
  ('S-108','FAC-024','22" HD lace frontal 13x6, density 180%','in_production','2026-04-09','2026-05-06',null),
  ('S-109','FAC-031','Clip-in set 7pc, 18" honey balayage','rejected','2026-03-28',null,'Tone ran orange. Revised swatch sent Apr 14.'),
  ('S-112','FAC-042','Balayage strand test, custom #7N>#22','received','2026-04-11','2026-04-25',null),
  ('S-115','FAC-055','Soft-touch boxes v3, gold foil "Halo"','shipping','2026-04-14','2026-04-24',null),
  ('S-118','FAC-063','Temple hair, 24" natural black unprocessed','requested','2026-04-18','2026-05-16',null),
  ('S-120','FAC-071','Prototype halo extension, invisible wire','in_production','2026-04-13','2026-04-27',null),
  ('S-121','FAC-031','14" clip-in fringe, bang set 3pc','requested','2026-04-18','2026-05-11',null),
  ('S-122','FAC-024','22" full lace wig, bleached knots','approved','2026-03-20','2026-04-19','Hero SKU for launch.'),
  ('S-123','FAC-042','Revised balayage, custom #4>#20 gradient','shipping','2026-04-15','2026-04-26',null),
  ('S-124','FAC-055','Silk pouch, embossed logo','received','2026-04-08','2026-04-20',null),
  ('S-125','FAC-071','Halo prototype v2, nude band','approved','2026-03-30','2026-04-12',null)
on conflict (id) do nothing;

-- =====================================================
-- WHATSAPP THREADS (wa_phone is unique)
-- =====================================================
insert into wa_threads (factory_id, wa_phone, name, pinned, unread_count, last_message_at, last_message_preview) values
  ('FAC-018','+8613810427788','Lin Wei · Meilong',true,2,'2026-04-18 09:41:00+00','Sure, we can pull 20" & 22" from the same donor. Sending photos now.'),
  ('FAC-031','+8617703192256','Mei Chen · Crownroot',false,4,'2026-04-18 08:20:00+00','Payment confirmation received for PO-2041, thank you!'),
  ('FAC-024','+8615937220411','Helen Zhao · Arclight',false,0,'2026-04-17 15:40:00+00','You: Confirmed, PO-2043 signed. Sending 50% deposit today.'),
  ('FAC-042','+8613588029911','Ivy Tan · Velora',false,1,'2026-04-17 17:02:00+00','Tracking: DHL 6741-0922-77. Should arrive Apr 26.'),
  ('FAC-063','+919840422117','Priya R. · Kalpana',false,3,'2026-04-15 11:22:00+00','Pricing sheet attached. Let me know sample quantity needed.'),
  ('FAC-055','+8618957106633','Rachel Gu · Silkbridge',false,0,'2026-04-13 09:45:00+00','You: Looks good, proceed to production.'),
  ('FAC-071','+8618666302087','Kevin Xu · Haloworks',false,0,'2026-04-14 16:45:00+00','Got it. v3 start tomorrow. Target ETA Apr 27.')
on conflict (wa_phone) do nothing;

-- =====================================================
-- WHATSAPP MESSAGES (telnyx_id partial unique → idempotent)
-- =====================================================
insert into wa_messages (thread_id, direction, body, media_type, telnyx_id, status, sent_at)
select t.id, v.direction, v.body, v.media_type, v.telnyx_id, v.status, v.sent_at::timestamptz
from wa_threads t
join (values
  ('+8613810427788','inbound','Hi! Following up on sample S-104. Photos attached of the final batch.',null,'seed-w1-1','delivered','2026-04-17 14:22:00+00'),
  ('+8613810427788','inbound','Final batch — 20" natural 1B, cuticle-aligned','image','seed-w1-2','delivered','2026-04-17 14:22:30+00'),
  ('+8613810427788','outbound','These look great. Can you confirm all from same donor? And the weight per bundle?',null,'seed-w1-3','read','2026-04-17 21:04:00+00'),
  ('+8613810427788','inbound','Yes all single donor. 100g / bundle, ±2g tolerance.',null,'seed-w1-4','delivered','2026-04-18 08:30:00+00'),
  ('+8613810427788','inbound','Sure, we can pull 20" & 22" from the same donor. Sending photos now.',null,'seed-w1-5','delivered','2026-04-18 09:41:00+00'),

  ('+8617703192256','inbound','Good morning! The revised clip-in set is ready to ship.',null,'seed-w2-1','delivered','2026-04-18 08:02:00+00'),
  ('+8617703192256','inbound','Honey balayage — revised batch','image','seed-w2-2','delivered','2026-04-18 08:03:00+00'),
  ('+8617703192256','outbound','The revised swatch is closer but still a little warm. Can you try cooler?',null,'seed-w2-3','read','2026-04-18 08:12:00+00'),
  ('+8617703192256','inbound','Of course. We can adjust to a cooler ash tone. Need 4-5 days.',null,'seed-w2-4','delivered','2026-04-18 08:14:00+00'),
  ('+8617703192256','inbound','Do you want us to hold shipment until new batch is done?',null,'seed-w2-5','delivered','2026-04-18 08:14:30+00'),
  ('+8617703192256','inbound','Payment confirmation received for PO-2041, thank you!',null,'seed-w2-6','delivered','2026-04-18 08:20:00+00'),

  ('+8615937220411','inbound','Invoice for PO-2043 attached. Lead time 25 days from deposit.','document','seed-w3-1','delivered','2026-04-17 10:15:00+00'),
  ('+8615937220411','outbound','Confirmed, PO-2043 signed. Sending 50% deposit today.',null,'seed-w3-2','read','2026-04-17 15:40:00+00'),

  ('+8613588029911','inbound','Revised balayage sample has shipped today.',null,'seed-w4-1','delivered','2026-04-17 17:01:00+00'),
  ('+8613588029911','inbound','Tracking: DHL 6741-0922-77. Should arrive Apr 26.',null,'seed-w4-2','delivered','2026-04-17 17:02:00+00'),

  ('+919840422117','inbound','Namaste! We have temple hair batch from last weekend''s collection. 24"+ available.',null,'seed-w5-1','delivered','2026-04-15 11:20:00+00'),
  ('+919840422117','inbound','Can offer 40kg total. Single-origin, unprocessed.',null,'seed-w5-2','delivered','2026-04-15 11:21:00+00'),
  ('+919840422117','inbound','Pricing sheet attached. Let me know sample quantity needed.','document','seed-w5-3','delivered','2026-04-15 11:22:00+00'),

  ('+8618957106633','inbound','Proof v3 for boxes attached. Gold foil is 24k equivalent.','image','seed-w6-1','delivered','2026-04-13 09:10:00+00'),
  ('+8618957106633','outbound','Looks good, proceed to production.',null,'seed-w6-2','read','2026-04-13 09:45:00+00'),

  ('+8618666302087','outbound','Prototype v2 approved — moving to v3 with softer band.',null,'seed-w7-1','read','2026-04-14 16:30:00+00'),
  ('+8618666302087','inbound','Got it. v3 start tomorrow. Target ETA Apr 27.',null,'seed-w7-2','delivered','2026-04-14 16:45:00+00')
) as v(phone, direction, body, media_type, telnyx_id, status, sent_at)
  on t.wa_phone = v.phone
on conflict (telnyx_id) where telnyx_id is not null do nothing;

-- =====================================================
-- INVOICES  (prototype statuses: parsed/approved/needs_review
--           → schema: parsed/confirmed/parsed)
-- =====================================================
insert into invoices (factory_id, file_url, source, parse_status, parse_confidence, invoice_number, invoice_date, due_date, currency, subtotal, shipping, tax, total, payment_terms) values
  ('FAC-024','https://example.invalid/arclight-PO2043-invoice.pdf','upload','parsed',0.97,'AR-2026-0413','2026-04-17','2026-05-17','USD',12000,320,160,12480,'50/50 T/T'),
  ('FAC-031','https://example.invalid/crownroot-PO2041-invoice.pdf','upload','confirmed',0.94,'CR-0412-118','2026-04-12','2026-05-12','USD',4650,120,80,4850,'30/70 T/T'),
  ('FAC-018','https://example.invalid/meilong-proforma-20Apr.pdf','upload','parsed',0.82,'ML-20260420','2026-04-20','2026-05-20','USD',8300,280,140,8720,'30/70 T/T'),
  ('FAC-042','https://example.invalid/velora-sample-invoice-Apr.pdf','upload','parsed',0.99,'VL-041126','2026-04-11','2026-04-25','USD',150,12,6,168,'100% T/T'),
  ('FAC-055','https://example.invalid/silkbridge-proof-invoice.pdf','upload','confirmed',0.96,'SB-0408','2026-04-08','2026-05-08','USD',2050,60,40,2150,'30/70 T/T')
on conflict do nothing;

-- =====================================================
-- ACTIVITY (latest first)
-- =====================================================
insert into activity (kind, entity_type, entity_id, payload, created_at) values
  ('wa.message', 'thread', 'FAC-018', '{"preview":"Confirmed single-donor 20\" & 22\"."}'::jsonb, '2026-04-18 09:41:00+00'),
  ('invoice.confirmed', 'invoice', 'AR-2026-0413', '{"total":12480}'::jsonb, '2026-04-18 09:12:00+00'),
  ('invoice.parsed', 'invoice', 'AR-2026-0413', '{"confidence":0.97}'::jsonb, '2026-04-18 08:30:00+00'),
  ('wa.message', 'thread', 'FAC-031', '{"preview":"Clip-in color revision — 3 msgs"}'::jsonb, '2026-04-18 08:12:00+00'),
  ('po.confirmed', 'po', 'PO-2043', '{"factory":"FAC-024","lead_days":25}'::jsonb, '2026-04-17 15:40:00+00'),
  ('sample.stage_changed', 'sample', 'S-123', '{"to":"shipping","tracking":"DHL 6741-0922-77"}'::jsonb, '2026-04-17 17:02:00+00'),
  ('factory.offer', 'factory', 'FAC-063', '{"note":"Offered temple hair batch, 40kg available."}'::jsonb, '2026-04-15 11:22:00+00'),
  ('sample.stage_changed', 'sample', 'S-104', '{"to":"approved"}'::jsonb, '2026-04-14 12:00:00+00'),
  ('invoice.uploaded', 'invoice', 'ML-20260420', '{"source":"upload"}'::jsonb, '2026-04-20 08:45:00+00'),
  ('sample.stage_changed', 'sample', 'S-115', '{"to":"shipping"}'::jsonb, '2026-04-16 14:20:00+00')
on conflict do nothing;
