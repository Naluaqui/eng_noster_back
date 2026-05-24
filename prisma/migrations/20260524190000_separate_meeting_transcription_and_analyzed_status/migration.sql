ALTER TYPE "MeetingStatus" ADD VALUE 'analyzed';

ALTER TABLE "meetings" ADD COLUMN "transcription" TEXT;

UPDATE "meetings"
SET "transcription" = "description",
    "description" = NULL
WHERE "description" IS NOT NULL;

ALTER TABLE "meetings" ALTER COLUMN "description" TYPE VARCHAR(500);
