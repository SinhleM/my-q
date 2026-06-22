-- Remove the overly broad policy that exposes ALL pending payment requests to
-- any anonymous caller. The scan page now queries via the service role filtered
-- by a specific owner_id, so no public RLS policy is required.
DROP POLICY IF EXISTS "Public payment requests readable by anyone (for QR pay page)"
    ON public.payment_requests;
