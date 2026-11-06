DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "attendance_statuses") THEN
        RAISE EXCEPTION 'Cannot migrate attendance_statuses: existing global rows require an explicit institution assignment before adding institution_id';
    END IF;
END
$$;

ALTER TABLE "attendance_statuses" ADD COLUMN "institution_id" UUID NOT NULL;

DROP INDEX "attendance_statuses_name_key";

CREATE UNIQUE INDEX "attendance_statuses_institution_id_name_key"
    ON "attendance_statuses"("institution_id", "name");

CREATE INDEX "attendance_statuses_institution_id_idx"
    ON "attendance_statuses"("institution_id");

ALTER TABLE "attendance_statuses"
    ADD CONSTRAINT "attendance_statuses_institution_id_fkey"
    FOREIGN KEY ("institution_id") REFERENCES "institutions"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
