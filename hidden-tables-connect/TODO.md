# Fix Orders FK Constraint Error

## Step 1: Clean Next.js cache (completed after run)

```
rmdir /s .next
npm run dev
```

## Step 2: Local Supabase ERROR - Docker Desktop required (Windows)

```
1. Install Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
2. OR use remote Supabase: supabase.com → New Project → Copy URL/anon key to .env.local
3. `npx supabase db reset` after fix
```

✅ .env.example created

## Step 3: ✅ Fixed checkout/page.tsx - Added FK-specific error + logging

## Step 4: ✅ .env.example created (copy to .env.local with Supabase URL/KEY)

## Step 5: ✅ Schema updated with total_price column. Restaurant lookup fixed (.ilike → .eq).

Run full supabase-schema.sql in Supabase dashboard SQL editor.
RLS may need disable for anon key: ALTER TABLE orders DISABLE ROW LEVEL SECURITY; (temporary)
Test checkout @ localhost:3001

## Step 6: Verify order insert in Supabase dashboard
