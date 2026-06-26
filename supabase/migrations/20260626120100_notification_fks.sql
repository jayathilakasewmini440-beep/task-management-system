-- BE-19: add referential integrity for notification task/project links.
-- First null out any pre-existing orphan links so the constraints can be added
-- cleanly, then add FKs with ON DELETE SET NULL (preserve the notification row,
-- drop the dangling link). Idempotent.
UPDATE "notifications" SET "task_id" = NULL
  WHERE "task_id" IS NOT NULL AND "task_id" NOT IN (SELECT "id" FROM "tasks");

UPDATE "notifications" SET "project_id" = NULL
  WHERE "project_id" IS NOT NULL AND "project_id" NOT IN (SELECT "id" FROM "projects");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_task') THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "fk_notifications_task"
      FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_notifications_project') THEN
    ALTER TABLE "notifications"
      ADD CONSTRAINT "fk_notifications_project"
      FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_notif_project" ON "notifications"("project_id");
