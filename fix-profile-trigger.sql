-- ============================================================================
-- FIX: Auto-Create Profile Trigger (Simplified Version)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS \$\$
BEGIN
  -- Check if profile already exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.id) THEN
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
    );
  END IF;
  RETURN NEW;
END;
\$\$ language plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- MANUAL FIX: Create profiles for existing users
-- Uncomment and run if you have users without profiles:
-- ============================================================================

-- INSERT INTO profiles (id, email, display_name)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'display_name', SPLIT_PART(email, '@', 1))
-- FROM auth.users
-- WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);

-- ============================================================================
-- VERIFICATION: Check if it worked
-- ============================================================================
-- SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;

-- ============================================================================
-- If trigger still doesn't work, run this SQL to manually create profile:
-- ============================================================================
-- INSERT INTO profiles (id, email, display_name)
-- VALUES ('USER_ID_FROM_AUTH', 'user@example.com', 'username');

-- ============================================================================
-- IMPORTANT: After running this SQL, have existing users:
-- 1. Sign out from the app
-- 2. Sign back in (this should trigger the profile creation)
-- ============================================================================

SELECT '✅ Trigger created successfully!' as status;
