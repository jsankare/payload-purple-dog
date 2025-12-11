import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('particulier', 'professionnel', 'admin');
  CREATE TYPE "public"."enum_users_account_status" AS ENUM('pending', 'active', 'suspended', 'rejected', 'blocked');
  CREATE TYPE "public"."enum_users_block_reason" AS ENUM('fraud', 'non_payment', 'terms_violation', 'inappropriate_behavior', 'fake_documents', 'repeated_disputes', 'other');
  CREATE TYPE "public"."enum_users_subscription_status" AS ENUM('active', 'trialing', 'suspended', 'canceled', 'expired', 'restricted');
  CREATE TYPE "public"."enum_plans_user_type" AS ENUM('particulier', 'professionnel');
  CREATE TYPE "public"."enum_subscriptions_status" AS ENUM('active', 'trialing', 'suspended', 'canceled', 'expired');
  CREATE TYPE "public"."enum_subscriptions_payment_method" AS ENUM('card', 'paypal', 'bank_transfer', 'free');
  CREATE TYPE "public"."enum_objects_sale_mode" AS ENUM('auction', 'quick-sale');
  CREATE TYPE "public"."enum_objects_status" AS ENUM('draft', 'pending', 'active', 'sold', 'withdrawn', 'rejected', 'expired');
  CREATE TYPE "public"."enum_bids_bid_type" AS ENUM('manual', 'automatic');
  CREATE TYPE "public"."enum_bids_status" AS ENUM('active', 'outbid', 'winning', 'lost');
  CREATE TYPE "public"."enum_categories_form_customization_additional_fields_field_type" AS ENUM('text', 'number', 'date', 'checkbox', 'select');
  CREATE TYPE "public"."enum_transactions_type" AS ENUM('sale_payment', 'platform_commission', 'seller_payout', 'subscription', 'refund', 'dispute');
  CREATE TYPE "public"."enum_transactions_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'canceled');
  CREATE TYPE "public"."enum_transactions_payment_method" AS ENUM('card', 'bank_transfer', 'paypal', 'stripe');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'particulier' NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"profile_photo_id" integer,
  	"address_street" varchar NOT NULL,
  	"address_city" varchar NOT NULL,
  	"address_postal_code" varchar NOT NULL,
  	"address_country" varchar DEFAULT 'France' NOT NULL,
  	"is_over18" boolean,
  	"company_name" varchar,
  	"siret" varchar,
  	"official_document_id" integer,
  	"website" varchar,
  	"social_media_facebook" varchar,
  	"social_media_instagram" varchar,
  	"social_media_linkedin" varchar,
  	"social_media_twitter" varchar,
  	"bank_details_iban" varchar,
  	"bank_details_bic" varchar,
  	"bank_details_account_holder_name" varchar,
  	"bank_details_bank_details_verified" boolean DEFAULT false,
  	"accepted_terms" boolean,
  	"accepted_mandate" boolean,
  	"accepted_g_d_p_r" boolean,
  	"newsletter_subscription" boolean DEFAULT false,
  	"account_status" "enum_users_account_status" DEFAULT 'pending',
  	"is_blocked" boolean DEFAULT false,
  	"block_reason" "enum_users_block_reason",
  	"block_reason_details" varchar,
  	"blocked_at" timestamp(3) with time zone,
  	"blocked_by_id" integer,
  	"current_subscription_id" integer,
  	"subscription_status" "enum_users_subscription_status",
  	"stripe_customer_id" varchar,
  	"stripe_subscription_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"_verified" boolean,
  	"_verificationtoken" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "plans_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE "plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"user_type" "enum_plans_user_type" NOT NULL,
  	"price" numeric DEFAULT 0 NOT NULL,
  	"trial_period_days" numeric DEFAULT 0,
  	"description" varchar,
  	"is_active" boolean DEFAULT true,
  	"is_default" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "subscriptions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"plan_id" integer NOT NULL,
  	"status" "enum_subscriptions_status" DEFAULT 'active' NOT NULL,
  	"current_period_start" timestamp(3) with time zone NOT NULL,
  	"current_period_end" timestamp(3) with time zone NOT NULL,
  	"trial_end" timestamp(3) with time zone,
  	"canceled_at" timestamp(3) with time zone,
  	"auto_renew" boolean DEFAULT true,
  	"payment_method" "enum_subscriptions_payment_method",
  	"amount" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer NOT NULL,
  	"stars" numeric NOT NULL,
  	"nps_score" numeric NOT NULL,
  	"comment" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "objects_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"document_id" integer NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "objects_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer NOT NULL
  );
  
  CREATE TABLE "objects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"category_id" integer NOT NULL,
  	"description" varchar NOT NULL,
  	"dimensions_length" numeric NOT NULL,
  	"dimensions_width" numeric NOT NULL,
  	"dimensions_height" numeric NOT NULL,
  	"dimensions_weight" numeric NOT NULL,
  	"price" numeric NOT NULL,
  	"sale_mode" "enum_objects_sale_mode" DEFAULT 'auction' NOT NULL,
  	"auction_config_starting_price" numeric,
  	"auction_config_reserve_price" numeric,
  	"auction_config_duration" numeric DEFAULT 7,
  	"auction_config_start_date" timestamp(3) with time zone,
  	"auction_config_end_date" timestamp(3) with time zone,
  	"auction_config_current_bid" numeric DEFAULT 0,
  	"auction_config_bid_count" numeric DEFAULT 0,
  	"seller_id" integer NOT NULL,
  	"status" "enum_objects_status" DEFAULT 'active' NOT NULL,
  	"buyer_id" integer,
  	"sold_price" numeric,
  	"sold_date" timestamp(3) with time zone,
  	"views" numeric DEFAULT 0,
  	"favorites" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bids" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"object_id" integer NOT NULL,
  	"bidder_id" integer NOT NULL,
  	"amount" numeric NOT NULL,
  	"bid_type" "enum_bids_bid_type" DEFAULT 'manual' NOT NULL,
  	"max_auto_bid" numeric,
  	"status" "enum_bids_status" DEFAULT 'active' NOT NULL,
  	"notified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_form_customization_additional_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field_name" varchar NOT NULL,
  	"field_label" varchar NOT NULL,
  	"field_type" "enum_categories_form_customization_additional_fields_field_type" NOT NULL,
  	"is_required" boolean DEFAULT false
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"icon_id" integer,
  	"image_id" integer,
  	"parent_category_id" integer,
  	"order" numeric DEFAULT 0,
  	"is_active" boolean DEFAULT true,
  	"featured_on_home" boolean DEFAULT false,
  	"custom_commissions_use_custom_commissions" boolean DEFAULT false,
  	"custom_commissions_buyer_commission" numeric,
  	"custom_commissions_seller_commission" numeric,
  	"form_customization_require_certificate" boolean DEFAULT false,
  	"form_customization_require_expertise" boolean DEFAULT false,
  	"object_count" numeric DEFAULT 0,
  	"active_auctions_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "settings_category_commissions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"buyer_commission" numeric DEFAULT 5,
  	"seller_commission" numeric DEFAULT 10
  );
  
  CREATE TABLE "settings_form_config_required_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"field_name" varchar
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"global_commissions_buyer_commission" numeric DEFAULT 5,
  	"global_commissions_seller_commission" numeric DEFAULT 10,
  	"form_config_min_photos" numeric DEFAULT 1,
  	"form_config_max_photos" numeric DEFAULT 10,
  	"form_config_enable_certificates" boolean DEFAULT true,
  	"form_config_enable_expertise" boolean DEFAULT true,
  	"general_settings_maintenance_mode" boolean DEFAULT false,
  	"general_settings_registration_enabled" boolean DEFAULT true,
  	"general_settings_auction_enabled" boolean DEFAULT true,
  	"general_settings_quick_sale_enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"transaction_id" varchar NOT NULL,
  	"type" "enum_transactions_type" NOT NULL,
  	"buyer_id" integer,
  	"seller_id" integer,
  	"user_id" integer,
  	"object_id" integer,
  	"amount" numeric NOT NULL,
  	"buyer_commission" numeric,
  	"seller_commission" numeric,
  	"platform_revenue" numeric,
  	"status" "enum_transactions_status" DEFAULT 'pending' NOT NULL,
  	"payment_method" "enum_transactions_payment_method",
  	"stripe_payment_intent_id" varchar,
  	"stripe_transfer_id" varchar,
  	"processed_at" timestamp(3) with time zone,
  	"completed_at" timestamp(3) with time zone,
  	"description" varchar,
  	"internal_notes" varchar,
  	"metadata" jsonb,
  	"invoice_number" varchar,
  	"invoice_url" varchar,
  	"fiscal_year" numeric,
  	"is_reconciled" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"plans_id" integer,
  	"subscriptions_id" integer,
  	"posts_id" integer,
  	"feedback_id" integer,
  	"objects_id" integer,
  	"bids_id" integer,
  	"categories_id" integer,
  	"settings_id" integer,
  	"transactions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_profile_photo_id_media_id_fk" FOREIGN KEY ("profile_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_official_document_id_media_id_fk" FOREIGN KEY ("official_document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_blocked_by_id_users_id_fk" FOREIGN KEY ("blocked_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_current_subscription_id_subscriptions_id_fk" FOREIGN KEY ("current_subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "plans_features" ADD CONSTRAINT "plans_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "objects_documents" ADD CONSTRAINT "objects_documents_document_id_media_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "objects_documents" ADD CONSTRAINT "objects_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "objects_photos" ADD CONSTRAINT "objects_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "objects_photos" ADD CONSTRAINT "objects_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "objects" ADD CONSTRAINT "objects_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "objects" ADD CONSTRAINT "objects_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "objects" ADD CONSTRAINT "objects_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bids" ADD CONSTRAINT "bids_object_id_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."objects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bids" ADD CONSTRAINT "bids_bidder_id_users_id_fk" FOREIGN KEY ("bidder_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_form_customization_additional_fields" ADD CONSTRAINT "categories_form_customization_additional_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_icon_id_media_id_fk" FOREIGN KEY ("icon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_category_id_categories_id_fk" FOREIGN KEY ("parent_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings_category_commissions" ADD CONSTRAINT "settings_category_commissions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings_category_commissions" ADD CONSTRAINT "settings_category_commissions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_form_config_required_fields" ADD CONSTRAINT "settings_form_config_required_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_users_id_fk" FOREIGN KEY ("buyer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_object_id_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "public"."objects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_plans_fk" FOREIGN KEY ("plans_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_subscriptions_fk" FOREIGN KEY ("subscriptions_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_objects_fk" FOREIGN KEY ("objects_id") REFERENCES "public"."objects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bids_fk" FOREIGN KEY ("bids_id") REFERENCES "public"."bids"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_settings_fk" FOREIGN KEY ("settings_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_profile_photo_idx" ON "users" USING btree ("profile_photo_id");
  CREATE INDEX "users_official_document_idx" ON "users" USING btree ("official_document_id");
  CREATE INDEX "users_blocked_by_idx" ON "users" USING btree ("blocked_by_id");
  CREATE INDEX "users_current_subscription_idx" ON "users" USING btree ("current_subscription_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "plans_features_order_idx" ON "plans_features" USING btree ("_order");
  CREATE INDEX "plans_features_parent_id_idx" ON "plans_features" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "plans_slug_idx" ON "plans" USING btree ("slug");
  CREATE INDEX "plans_updated_at_idx" ON "plans" USING btree ("updated_at");
  CREATE INDEX "plans_created_at_idx" ON "plans" USING btree ("created_at");
  CREATE INDEX "subscriptions_user_idx" ON "subscriptions" USING btree ("user_id");
  CREATE INDEX "subscriptions_plan_idx" ON "subscriptions" USING btree ("plan_id");
  CREATE INDEX "subscriptions_updated_at_idx" ON "subscriptions" USING btree ("updated_at");
  CREATE INDEX "subscriptions_created_at_idx" ON "subscriptions" USING btree ("created_at");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "feedback_user_idx" ON "feedback" USING btree ("user_id");
  CREATE INDEX "feedback_updated_at_idx" ON "feedback" USING btree ("updated_at");
  CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
  CREATE INDEX "objects_documents_order_idx" ON "objects_documents" USING btree ("_order");
  CREATE INDEX "objects_documents_parent_id_idx" ON "objects_documents" USING btree ("_parent_id");
  CREATE INDEX "objects_documents_document_idx" ON "objects_documents" USING btree ("document_id");
  CREATE INDEX "objects_photos_order_idx" ON "objects_photos" USING btree ("_order");
  CREATE INDEX "objects_photos_parent_id_idx" ON "objects_photos" USING btree ("_parent_id");
  CREATE INDEX "objects_photos_photo_idx" ON "objects_photos" USING btree ("photo_id");
  CREATE INDEX "objects_category_idx" ON "objects" USING btree ("category_id");
  CREATE INDEX "objects_seller_idx" ON "objects" USING btree ("seller_id");
  CREATE INDEX "objects_buyer_idx" ON "objects" USING btree ("buyer_id");
  CREATE INDEX "objects_updated_at_idx" ON "objects" USING btree ("updated_at");
  CREATE INDEX "objects_created_at_idx" ON "objects" USING btree ("created_at");
  CREATE INDEX "bids_object_idx" ON "bids" USING btree ("object_id");
  CREATE INDEX "bids_bidder_idx" ON "bids" USING btree ("bidder_id");
  CREATE INDEX "bids_updated_at_idx" ON "bids" USING btree ("updated_at");
  CREATE INDEX "bids_created_at_idx" ON "bids" USING btree ("created_at");
  CREATE INDEX "categories_form_customization_additional_fields_order_idx" ON "categories_form_customization_additional_fields" USING btree ("_order");
  CREATE INDEX "categories_form_customization_additional_fields_parent_id_idx" ON "categories_form_customization_additional_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_icon_idx" ON "categories" USING btree ("icon_id");
  CREATE INDEX "categories_image_idx" ON "categories" USING btree ("image_id");
  CREATE INDEX "categories_parent_category_idx" ON "categories" USING btree ("parent_category_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "settings_category_commissions_order_idx" ON "settings_category_commissions" USING btree ("_order");
  CREATE INDEX "settings_category_commissions_parent_id_idx" ON "settings_category_commissions" USING btree ("_parent_id");
  CREATE INDEX "settings_category_commissions_category_idx" ON "settings_category_commissions" USING btree ("category_id");
  CREATE INDEX "settings_form_config_required_fields_order_idx" ON "settings_form_config_required_fields" USING btree ("_order");
  CREATE INDEX "settings_form_config_required_fields_parent_id_idx" ON "settings_form_config_required_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "settings_key_idx" ON "settings" USING btree ("key");
  CREATE INDEX "settings_updated_at_idx" ON "settings" USING btree ("updated_at");
  CREATE INDEX "settings_created_at_idx" ON "settings" USING btree ("created_at");
  CREATE UNIQUE INDEX "transactions_transaction_id_idx" ON "transactions" USING btree ("transaction_id");
  CREATE INDEX "transactions_buyer_idx" ON "transactions" USING btree ("buyer_id");
  CREATE INDEX "transactions_seller_idx" ON "transactions" USING btree ("seller_id");
  CREATE INDEX "transactions_user_idx" ON "transactions" USING btree ("user_id");
  CREATE INDEX "transactions_object_idx" ON "transactions" USING btree ("object_id");
  CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");
  CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("plans_id");
  CREATE INDEX "payload_locked_documents_rels_subscriptions_id_idx" ON "payload_locked_documents_rels" USING btree ("subscriptions_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_id");
  CREATE INDEX "payload_locked_documents_rels_objects_id_idx" ON "payload_locked_documents_rels" USING btree ("objects_id");
  CREATE INDEX "payload_locked_documents_rels_bids_id_idx" ON "payload_locked_documents_rels" USING btree ("bids_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("settings_id");
  CREATE INDEX "payload_locked_documents_rels_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("transactions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "plans_features" CASCADE;
  DROP TABLE "plans" CASCADE;
  DROP TABLE "subscriptions" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "feedback" CASCADE;
  DROP TABLE "objects_documents" CASCADE;
  DROP TABLE "objects_photos" CASCADE;
  DROP TABLE "objects" CASCADE;
  DROP TABLE "bids" CASCADE;
  DROP TABLE "categories_form_customization_additional_fields" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "settings_category_commissions" CASCADE;
  DROP TABLE "settings_form_config_required_fields" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TABLE "transactions" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_account_status";
  DROP TYPE "public"."enum_users_block_reason";
  DROP TYPE "public"."enum_users_subscription_status";
  DROP TYPE "public"."enum_plans_user_type";
  DROP TYPE "public"."enum_subscriptions_status";
  DROP TYPE "public"."enum_subscriptions_payment_method";
  DROP TYPE "public"."enum_objects_sale_mode";
  DROP TYPE "public"."enum_objects_status";
  DROP TYPE "public"."enum_bids_bid_type";
  DROP TYPE "public"."enum_bids_status";
  DROP TYPE "public"."enum_categories_form_customization_additional_fields_field_type";
  DROP TYPE "public"."enum_transactions_type";
  DROP TYPE "public"."enum_transactions_status";
  DROP TYPE "public"."enum_transactions_payment_method";`)
}
