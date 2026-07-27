-- CreateTable
CREATE TABLE "hero_content" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "eyebrow" TEXT NOT NULL,
    "slogan" TEXT NOT NULL,
    "subcopy" TEXT NOT NULL,
    "primary_cta_label" TEXT NOT NULL,
    "primary_cta_href" TEXT NOT NULL,
    "secondary_cta_label" TEXT NOT NULL,
    "secondary_cta_href" TEXT NOT NULL,
    "image_asset_key" TEXT NOT NULL,
    "image_alt" TEXT NOT NULL,
    "image_aspect_ratio" DOUBLE PRECISION,
    "image_ext" TEXT,

    CONSTRAINT "hero_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brand_story" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "paragraphs" JSONB NOT NULL,
    "name_meaning_reading" TEXT NOT NULL,
    "name_meaning_meaning" TEXT NOT NULL,
    "image_asset_key" TEXT NOT NULL,
    "image_alt" TEXT NOT NULL,
    "image_aspect_ratio" DOUBLE PRECISION,
    "image_ext" TEXT,

    CONSTRAINT "brand_story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "silk_feature" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_asset_key" TEXT,
    "image_alt" TEXT,
    "image_aspect_ratio" DOUBLE PRECISION,
    "image_ext" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "silk_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_asset_key" TEXT NOT NULL,
    "image_alt" TEXT NOT NULL,
    "image_aspect_ratio" DOUBLE PRECISION,
    "image_ext" TEXT,
    "href" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bespoke_content" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "eyebrow" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "paragraphs" JSONB NOT NULL,
    "cta_label" TEXT NOT NULL,
    "cta_href" TEXT NOT NULL,
    "image_asset_key" TEXT NOT NULL,
    "image_alt" TEXT NOT NULL,
    "image_aspect_ratio" DOUBLE PRECISION,
    "image_ext" TEXT,

    CONSTRAINT "bespoke_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_step" (
    "id" TEXT NOT NULL,
    "step_id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "process_step_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_asset_key" TEXT NOT NULL,
    "image_alt" TEXT NOT NULL,
    "image_aspect_ratio" DOUBLE PRECISION,
    "image_ext" TEXT,
    "tags" JSONB NOT NULL,
    "story" TEXT,
    "specs" JSONB,
    "care" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "asset_key" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "aspect_ratio" DOUBLE PRECISION,
    "ext" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_item" (
    "id" TEXT NOT NULL,
    "asset_key" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "aspect_ratio" DOUBLE PRECISION,
    "ext" TEXT,
    "caption" TEXT NOT NULL,
    "span" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gallery_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "contact_info" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "showroom_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hours" JSONB NOT NULL,
    "note" TEXT NOT NULL,
    "socials" JSONB NOT NULL,
    "image_asset_key" TEXT,
    "image_alt" TEXT,
    "image_aspect_ratio" DOUBLE PRECISION,
    "image_ext" TEXT,

    CONSTRAINT "contact_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
