-- BE-18: enforce task priority/status enums at the database level (defense-in-depth).
-- The application already validates these, but a direct/raw write should also be
-- rejected. Idempotent so re-running the migration is safe.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tasks_priority') THEN
    ALTER TABLE "tasks"
      ADD CONSTRAINT "chk_tasks_priority" CHECK ("priority" IN ('Low', 'Medium', 'High'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_tasks_status') THEN
    ALTER TABLE "tasks"
      ADD CONSTRAINT "chk_tasks_status" CHECK ("status" IN ('To Do', 'In Progress', 'Completed'));
  END IF;
END $$;
