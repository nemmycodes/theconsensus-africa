
-- election_reports: agents cannot self-verify
DROP POLICY IF EXISTS "Agents can update own pending reports" ON public.election_reports;
CREATE POLICY "Agents can update own pending reports"
ON public.election_reports
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'agent'::app_role)
  AND auth.uid() = agent_id
  AND status = ANY (ARRAY['pending'::election_report_status, 'flagged'::election_report_status])
)
WITH CHECK (
  has_role(auth.uid(), 'agent'::app_role)
  AND auth.uid() = agent_id
  AND status = ANY (ARRAY['pending'::election_report_status, 'flagged'::election_report_status])
  AND verified_by IS NULL
  AND verified_at IS NULL
);

-- kef_cares_registrations: cannot reassign ownership
DROP POLICY IF EXISTS "Kef users can update own registration" ON public.kef_cares_registrations;
CREATE POLICY "Kef users can update own registration"
ON public.kef_cares_registrations
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'kef_user'::app_role) AND auth.uid() = user_id)
WITH CHECK (has_role(auth.uid(), 'kef_user'::app_role) AND auth.uid() = user_id);

-- primaries_collation: submitters cannot self-verify
DROP POLICY IF EXISTS "Submitters update own pending" ON public.primaries_collation;
CREATE POLICY "Submitters update own pending"
ON public.primaries_collation
FOR UPDATE
TO authenticated
USING (submitted_by = auth.uid() AND status <> 'verified'::primaries_status)
WITH CHECK (
  submitted_by = auth.uid()
  AND status <> 'verified'::primaries_status
  AND verified_by IS NULL
  AND verified_at IS NULL
);

-- primaries_contestants: submitters cannot set verified status
DROP POLICY IF EXISTS "Submitters update own contestants" ON public.primaries_contestants;
CREATE POLICY "Submitters update own contestants"
ON public.primaries_contestants
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.primaries_collation p
    WHERE p.id = primaries_contestants.primaries_id
      AND p.submitted_by = auth.uid()
      AND p.status <> 'verified'::primaries_status
  )
)
WITH CHECK (
  status = 'not_verified'::contestant_status
  AND votes >= 0
  AND EXISTS (
    SELECT 1 FROM public.primaries_collation p
    WHERE p.id = primaries_contestants.primaries_id
      AND p.submitted_by = auth.uid()
      AND p.status <> 'verified'::primaries_status
  )
);
