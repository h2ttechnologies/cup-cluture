-- Customers can opt in at checkout to receive WhatsApp updates about their order.
alter table public.orders
  add column if not exists whatsapp_updates boolean not null default false;
