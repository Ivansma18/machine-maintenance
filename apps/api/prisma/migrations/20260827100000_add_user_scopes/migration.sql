CREATE TYPE "ScopeLevel" AS ENUM ('SITE', 'AREA');
CREATE TABLE "UserScope" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "level" "ScopeLevel" NOT NULL,
    "siteId" UUID,
    "areaId" UUID,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserScope_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserScope_userId_level_siteId_areaId_key" ON "UserScope"("userId", "level", "siteId", "areaId");
CREATE INDEX "UserScope_userId_idx" ON "UserScope"("userId");
CREATE INDEX "UserScope_siteId_idx" ON "UserScope"("siteId");
CREATE INDEX "UserScope_areaId_idx" ON "UserScope"("areaId");
ALTER TABLE "UserScope" ADD CONSTRAINT "UserScope_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserScope" ADD CONSTRAINT "UserScope_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserScope" ADD CONSTRAINT "UserScope_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE CASCADE ON UPDATE CASCADE;
