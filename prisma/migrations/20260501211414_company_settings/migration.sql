-- AlterTable
ALTER TABLE "companies" ADD COLUMN     "about" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "culture" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "objectives" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "company_products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "about" VARCHAR(1000) NOT NULL,
    "solutionObjective" VARCHAR(1000) NOT NULL,
    "technology" VARCHAR(500) NOT NULL,
    "targetAudience" VARCHAR(500) NOT NULL,
    "averagePrice" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_teams" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "about" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "company_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_groups" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "about" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "company_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_people" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(120),
    "reportsToEmail" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "groupId" TEXT,

    CONSTRAINT "company_people_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "company_products" ADD CONSTRAINT "company_products_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_teams" ADD CONSTRAINT "company_teams_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_groups" ADD CONSTRAINT "company_groups_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "company_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_people" ADD CONSTRAINT "company_people_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_people" ADD CONSTRAINT "company_people_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "company_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_people" ADD CONSTRAINT "company_people_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
