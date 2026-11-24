-- Kitchen stock (inventory) for the Cup Culture admin site.
-- Run once in Supabase → SQL Editor. Safe to run again.
-- All tables are server-only: RLS is on with no policies, so only the admin site (secret key) can use them.

-- 1. Kitchen stock categories (e.g. Dairy, Coffee & Tea, Bakery, Packaging)
create table if not exists public.inventory_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- 2. Brands / suppliers
create table if not exists public.inventory_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_name text,
  phone text,
  notes text not null default '',
  created_at timestamptz not null default now()
);

-- 3. Stock items (raw materials and supplies, e.g. Milk, Coffee powder, Paper cups)
create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category_id uuid references public.inventory_categories(id) on delete set null,
  brand_id uuid references public.inventory_brands(id) on delete set null,
  unit text not null default 'pcs',
  reorder_level numeric(12,3) not null default 0 check (reorder_level >= 0),
  cost_per_unit numeric(12,2) not null default 0 check (cost_per_unit >= 0),
  track_expiry boolean not null default true,
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists inventory_items_name_idx on public.inventory_items (lower(name));

-- 4. Stock batches: every delivery is a batch with its own quantity and expiry date.
--    Current stock of an item = sum of its batch quantities.
create table if not exists public.inventory_batches (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity numeric(12,3) not null check (quantity >= 0),
  expiry_date date,
  cost_per_unit numeric(12,2),
  received_at timestamptz not null default now()
);
create index if not exists inventory_batches_item_idx on public.inventory_batches (item_id, expiry_date);

-- 5. Stock adjustments: the history of every change.
create table if not exists public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.inventory_items(id) on delete cascade,
  batch_id uuid references public.inventory_batches(id) on delete set null,
  change numeric(12,3) not null,
  quantity_after numeric(12,3) not null,
  reason text not null check (reason in ('Purchase','Usage','Wastage','Expired','Correction','Return')),
  note text not null default '',
  expiry_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_by_name text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists inventory_adjustments_item_idx on public.inventory_adjustments (item_id, created_at desc);
create index if not exists inventory_adjustments_time_idx on public.inventory_adjustments (created_at desc);


alter table public.inventory_categories enable row level security;
alter table public.inventory_brands enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_batches enable row level security;
alter table public.inventory_adjustments enable row level security;

-- 6. One safe function for every stock change.
--    Positive change → adds a new batch (with optional expiry).
--    Negative change → takes from the given batch, or from the batches that expire first.
create or replace function public.inventory_adjust(
  p_item uuid, p_change numeric, p_reason text, p_note text default '',
  p_expiry date default null, p_batch uuid default null, p_cost numeric default null,
  p_user uuid default null, p_user_name text default ''
) returns table(adjustment_id uuid, quantity_after numeric)
language plpgsql security definer set search_path = public as $$
declare
  remaining numeric := -p_change;
  b record;
  take numeric;
  new_batch uuid;
  total numeric;
  adj uuid;
begin
  if p_change = 0 then raise exception 'Change cannot be zero'; end if;
  perform 1 from inventory_items where id = p_item for update;
  if not found then raise exception 'Item not found'; end if;

  if p_change > 0 then
    insert into inventory_batches(item_id, quantity, expiry_date, cost_per_unit)
    values (p_item, p_change, p_expiry, p_cost) returning id into new_batch;
  else
    select coalesce(sum(quantity), 0) into total from inventory_batches where item_id = p_item;
    if total < remaining then raise exception 'Only % in stock', total; end if;
    for b in
      select id, quantity from inventory_batches
      where item_id = p_item and quantity > 0 and (p_batch is null or id = p_batch)
      order by expiry_date nulls last, received_at
      for update
    loop
      exit when remaining <= 0;
      take := least(b.quantity, remaining);
      update inventory_batches set quantity = quantity - take where id = b.id;
      remaining := remaining - take;
    end loop;
    if remaining > 0 then raise exception 'Not enough stock in that batch'; end if;
    delete from inventory_batches where item_id = p_item and quantity = 0;
  end if;

  select coalesce(sum(quantity), 0) into total from inventory_batches where item_id = p_item;
  insert into inventory_adjustments(item_id, batch_id, change, quantity_after, reason, note, expiry_date, created_by, created_by_name)
  values (p_item, new_batch, p_change, total, p_reason, coalesce(p_note, ''), p_expiry, p_user, coalesce(p_user_name, ''))
  returning id into adj;
  update inventory_items set updated_at = now() where id = p_item;
  return query select adj, total;
end $$;

revoke all on function public.inventory_adjust(uuid,numeric,text,text,date,uuid,numeric,uuid,text) from public, anon, authenticated;
grant execute on function public.inventory_adjust(uuid,numeric,text,text,date,uuid,numeric,uuid,text) to service_role;

-- Starter categories (skip if they already exist)
insert into public.inventory_categories(name) values
  ('Dairy'),('Coffee & Tea'),('Bakery'),('Vegetables'),('Meat & Eggs'),('Sauces & Spices'),('Frozen'),('Packaging'),('Cleaning')
on conflict (name) do nothing;
