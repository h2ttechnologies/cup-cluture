create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.users(id,email) values(new.id,new.email) on conflict(id) do update set email=excluded.email;
  insert into public.profiles(id,full_name,phone) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'phone') on conflict(id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.categories (
  id text primary key,
  name text not null unique,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.products (
  id text primary key,
  category_id text not null references public.categories(id) on update cascade,
  name text not null,
  price numeric(10,2) not null check(price >= 0),
  description text not null default '',
  image_url text,
  is_veg boolean not null default true,
  is_popular boolean not null default false,
  is_new_arrival boolean not null default false,
  is_available boolean not null default true,
  stock_quantity integer check(stock_quantity is null or stock_quantity >= 0),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id,display_order);
create index if not exists products_search_idx on public.products using gin(to_tsvector('simple',name||' '||description));
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.product_addons (
  id text primary key,
  product_id text references public.products(id) on delete cascade,
  name text not null,
  price numeric(10,2) not null check(price>=0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check(user_id is not null or session_id is not null)
);
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null references public.products(id),
  quantity integer not null check(quantity>0),
  selected_addons jsonb not null default '[]'::jsonb,
  special_instructions text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  order_type text not null check(order_type in ('Dine In','Takeaway','Home Delivery')),
  delivery_address text,
  delivery_postal_code text,
  delivery_landmark text,
  table_number text,
  pickup_at timestamptz,
  special_instructions text not null default '',
  status text not null default 'Order Placed' check(status in ('Order Placed','Order Confirmed','Preparing','Ready for Pickup','Out for Delivery','Delivered','Cancelled')),
  payment_method text not null,
  payment_status text not null default 'unpaid' check(payment_status in ('unpaid','paid')),
  subtotal numeric(10,2) not null check(subtotal>=0),
  tax_amount numeric(10,2) not null default 0 check(tax_amount>=0),
  delivery_charge numeric(10,2) not null default 0 check(delivery_charge>=0),
  total_amount numeric(10,2) not null check(total_amount>=0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id,created_at desc);
create index if not exists orders_phone_order_idx on public.orders(customer_phone,order_number);
create index if not exists orders_status_idx on public.orders(status,created_at desc);
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check(unit_price>=0),
  quantity integer not null check(quantity>0),
  special_instructions text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);
create table if not exists public.order_item_addons (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  addon_id text references public.product_addons(id) on delete set null,
  addon_name text not null,
  unit_price numeric(10,2) not null check(unit_price>=0),
  created_at timestamptz not null default now()
);
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  table_number text not null unique,
  capacity integer not null check(capacity>0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.reservation_slots (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check(weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  capacity integer not null check(capacity>=0),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(weekday,start_time),
  check(end_time>start_time)
);
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  reservation_date date not null,
  start_time time not null,
  guests integer not null check(guests>0),
  special_requests text not null default '',
  status text not null default 'Pending' check(status in ('Pending','Confirmed','Rejected','Cancelled','Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reservations_date_slot_idx on public.reservations(reservation_date,start_time,status);
create index if not exists reservations_user_idx on public.reservations(user_id,created_at desc);
create or replace function public.create_reservation(p_number text,p_name text,p_phone text,p_email text,p_date date,p_time time,p_guests integer,p_requests text,p_user uuid default null)
returns public.reservations language plpgsql security definer set search_path=public as $$
declare v_capacity integer; v_booked integer; v_result public.reservations;
begin
  if p_date<current_date or p_guests<1 then raise exception 'Please choose a valid date and party size'; end if;
  perform pg_advisory_xact_lock(hashtext(p_date::text||'|'||p_time::text));
  select capacity into v_capacity from public.reservation_slots where weekday=extract(dow from p_date)::integer and start_time=p_time and is_open=true;
  if v_capacity is null then raise exception 'That reservation time is not available'; end if;
  select coalesce(sum(guests),0) into v_booked from public.reservations where reservation_date=p_date and start_time=p_time and status in ('Pending','Confirmed');
  if v_booked+p_guests>v_capacity then raise exception 'There is not enough table capacity for this time'; end if;
  insert into public.reservations(reservation_number,customer_name,customer_phone,customer_email,reservation_date,start_time,guests,special_requests,user_id)
  values(p_number,p_name,p_phone,nullif(p_email,''),p_date,p_time,p_guests,coalesce(p_requests,''),p_user) returning * into v_result;
  return v_result;
end $$;

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Home',
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  landmark text,
  city text,
  postal_code text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses(user_id);
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  discount_type text not null check(discount_type in ('percent','fixed')),
  discount_value numeric(10,2) not null check(discount_value>=0),
  minimum_order numeric(10,2) not null default 0,
  max_discount numeric(10,2),
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  usage_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,product_id)
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  reservation_id uuid references public.reservations(id) on delete cascade,
  channel text not null check(channel in ('email','whatsapp','in_app')),
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check(status in ('pending','sent','failed')),
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id,created_at desc);
create table if not exists public.restaurant_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin')
$$;

alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_addons enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_item_addons enable row level security;
alter table public.reservations enable row level security;
alter table public.tables enable row level security;
alter table public.reservation_slots enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;
alter table public.favourites enable row level security;
alter table public.notifications enable row level security;
alter table public.restaurant_settings enable row level security;

create policy "Users read own row" on public.users for select using(id=auth.uid() or public.is_admin());
create policy "Users update own email row" on public.users for update using(id=auth.uid()) with check(id=auth.uid());
create policy "Profiles read own or admin" on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy "Profiles update own or admin" on public.profiles for update using(id=auth.uid() or public.is_admin()) with check((id=auth.uid() and role='customer') or public.is_admin());
create policy "Profiles admin insert" on public.profiles for insert with check(public.is_admin());
create policy "Categories public read" on public.categories for select using(is_active or public.is_admin());
create policy "Categories admin all" on public.categories for all using(public.is_admin()) with check(public.is_admin());
create policy "Products public read" on public.products for select using(is_available or public.is_admin());
create policy "Products admin all" on public.products for all using(public.is_admin()) with check(public.is_admin());
create policy "Images public read" on public.product_images for select using(true);
create policy "Images admin all" on public.product_images for all using(public.is_admin()) with check(public.is_admin());
create policy "Addons public read" on public.product_addons for select using(is_available or public.is_admin());
create policy "Addons admin all" on public.product_addons for all using(public.is_admin()) with check(public.is_admin());
create policy "Cart owners all" on public.carts for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy "Cart item owners all" on public.cart_items for all using(exists(select 1 from public.carts c where c.id=cart_id and (c.user_id=auth.uid() or public.is_admin()))) with check(exists(select 1 from public.carts c where c.id=cart_id and (c.user_id=auth.uid() or public.is_admin())));
create policy "Order customers read own" on public.orders for select using(user_id=auth.uid() or public.is_admin());
create policy "Order admin update" on public.orders for update using(public.is_admin()) with check(public.is_admin());
create policy "Order items owner read" on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "Order items admin all" on public.order_items for all using(public.is_admin()) with check(public.is_admin());
create policy "Order addons owner read" on public.order_item_addons for select using(exists(select 1 from public.order_items i join public.orders o on o.id=i.order_id where i.id=order_item_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "Order addons admin all" on public.order_item_addons for all using(public.is_admin()) with check(public.is_admin());
create policy "Reservations owner read" on public.reservations for select using(user_id=auth.uid() or public.is_admin());
create policy "Reservations customer cancel own" on public.reservations for update using(user_id=auth.uid() and status in ('Pending','Confirmed')) with check(user_id=auth.uid() and status='Cancelled');
create policy "Reservations admin all" on public.reservations for all using(public.is_admin()) with check(public.is_admin());
create policy "Tables public read available" on public.tables for select using(is_available or public.is_admin());
create policy "Tables admin all" on public.tables for all using(public.is_admin()) with check(public.is_admin());
create policy "Slots public read open" on public.reservation_slots for select using(is_open or public.is_admin());
create policy "Slots admin all" on public.reservation_slots for all using(public.is_admin()) with check(public.is_admin());
create policy "Addresses owner all" on public.addresses for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy "Active coupon read" on public.coupons for select using(is_active or public.is_admin());
create policy "Coupon admin all" on public.coupons for all using(public.is_admin()) with check(public.is_admin());
create policy "Favourite owner all" on public.favourites for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy "Notification owner read" on public.notifications for select using(user_id=auth.uid() or public.is_admin());
create policy "Notification admin all" on public.notifications for all using(public.is_admin()) with check(public.is_admin());
create policy "Public settings read" on public.restaurant_settings for select using(is_public or public.is_admin());
create policy "Settings admin all" on public.restaurant_settings for all using(public.is_admin()) with check(public.is_admin());

insert into public.restaurant_settings(key,value,is_public) values
('business', '{"name":"Cup Culture","tagline":"Just what you needed.","instagram":"@cupcultureindia","address":"","phone":"","email":"","whatsapp_number":"","opening_hours":"","map_url":""}', true),
('checkout', '{"tax_rate_percent":0,"delivery_fee":0,"delivery_minimum":0,"service_area_postcodes":[],"currency":"INR"}', true),
('reservation', '{"duration_minutes":90,"max_guests":8}', true)
on conflict(key) do nothing;

grant usage on schema public to anon, authenticated;
grant select on public.categories,public.products,public.product_images,public.product_addons,public.coupons,public.tables,public.reservation_slots,public.restaurant_settings to anon,authenticated;
grant select,insert,update,delete on all tables in schema public to authenticated;
grant execute on function public.create_reservation(text,text,text,text,date,time,integer,text,uuid) to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
on conflict(id) do update set public=true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/avif'];
create policy "Product images are public" on storage.objects for select using(bucket_id='product-images');
create policy "Only admins upload product images" on storage.objects for insert with check(bucket_id='product-images' and public.is_admin());
create policy "Only admins update product images" on storage.objects for update using(bucket_id='product-images' and public.is_admin()) with check(bucket_id='product-images' and public.is_admin());
create policy "Only admins delete product images" on storage.objects for delete using(bucket_id='product-images' and public.is_admin());
