-- Daily order numbers: CC-0001, CC-0002, … restarting at CC-0001 every day (India time, midnight).

-- 1. Each order remembers the café day it belongs to.
alter table public.orders
  add column if not exists order_date date not null default ((now() at time zone 'Asia/Kolkata')::date);

-- 2. The same number can be used once per day (instead of once forever).
alter table public.orders drop constraint if exists orders_order_number_key;
create unique index if not exists orders_daily_number_idx on public.orders(order_date, order_number);

-- 3. One counter row per day.
create table if not exists public.order_counters (
  order_date date primary key,
  last_number integer not null default 0
);
alter table public.order_counters enable row level security; -- no policies: only the server (secret key) can use it

-- 4. Hands out the next number for today. Safe when many orders arrive at once.
create or replace function public.next_order_number()
returns table(next_number text, next_date date)
language plpgsql
security definer
set search_path = public
as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  n integer;
begin
  insert into public.order_counters as c (order_date, last_number)
  values (today, 1)
  on conflict (order_date) do update set last_number = c.last_number + 1
  returning c.last_number into n;

  next_date := today;
  next_number := 'CC-' || case when n < 10000 then lpad(n::text, 4, '0') else n::text end;
  return next;
end;
$$;

revoke all on function public.next_order_number() from public, anon, authenticated;
grant execute on function public.next_order_number() to service_role;
