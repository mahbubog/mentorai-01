/*
  # Fix Admin Users RLS Policy

  1. Changes
    - Drop the circular RLS policy on admin_users table
    - Add a new policy that allows authenticated users to check if they are admins
    - This fixes the issue where users cannot verify their admin status

  2. Security
    - Users can only read their own admin status
    - No ability to see other admins
*/

-- Drop the existing circular policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Create a new policy that allows users to check their own admin status
CREATE POLICY "Users can check own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
