-- ============================================================================
-- 恋爱空间 (Couple Space) - Initial Database Schema
-- Version: 1.0.0
-- All tables with RLS, indexes, and proper foreign key constraints
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate a random 6-character couple code (alphanumeric, excludes ambiguous chars)
CREATE OR REPLACE FUNCTION generate_couple_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INT;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Check if the current user is a member of a given couple
CREATE OR REPLACE FUNCTION is_couple_member(cid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM couples
        WHERE id = cid AND (user1_id = auth.uid() OR user2_id = auth.uid())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get the couple ID for the current user
CREATE OR REPLACE FUNCTION get_user_couple_id()
RETURNS UUID AS $$
DECLARE
    cid UUID;
BEGIN
    SELECT id INTO cid FROM couples
    WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    LIMIT 1;
    RETURN cid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Tables
-- ============================================================================

-- ─── Profiles (extends auth.users) ──────────────────────────────────────────

CREATE TABLE profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT NOT NULL,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Couples ────────────────────────────────────────────────────────────────

CREATE TABLE couples (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_code     TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL DEFAULT '我们的空间',
    anniversary     DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user1_id        UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    user2_id        UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    CONSTRAINT different_users CHECK (user1_id IS DISTINCT FROM user2_id)
);

-- ─── Timeline Posts ─────────────────────────────────────────────────────────

CREATE TABLE timeline_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content         TEXT,
    image_urls      TEXT[] DEFAULT '{}',
    mood            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_posts_couple_created
    ON timeline_posts(couple_id, created_at DESC);

CREATE TRIGGER trg_timeline_posts_updated_at
    BEFORE UPDATE ON timeline_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Daily Check-ins ────────────────────────────────────────────────────────

CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    check_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    mood            TEXT,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, check_date)
);

CREATE INDEX idx_check_ins_couple_created
    ON check_ins(couple_id, created_at DESC);

-- ─── Wishes ─────────────────────────────────────────────────────────────────

CREATE TABLE wishes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    category        TEXT,
    is_fulfilled    BOOLEAN NOT NULL DEFAULT FALSE,
    fulfilled_at    TIMESTAMPTZ,
    fulfilled_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wishes_couple_created
    ON wishes(couple_id, created_at DESC);

-- ─── Love Letters ───────────────────────────────────────────────────────────

CREATE TABLE love_letters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    content         TEXT NOT NULL,
    mood            TEXT,
    is_opened       BOOLEAN NOT NULL DEFAULT FALSE,
    opened_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_love_letters_couple_created
    ON love_letters(couple_id, created_at DESC);

CREATE INDEX idx_love_letters_recipient
    ON love_letters(recipient_id, is_opened);

-- ─── Coupons ────────────────────────────────────────────────────────────────

CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    creator_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    holder_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    icon            TEXT NOT NULL DEFAULT '🎫',
    expires_at      TIMESTAMPTZ,
    is_redeemed     BOOLEAN NOT NULL DEFAULT FALSE,
    redeemed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_couple_created
    ON coupons(couple_id, created_at DESC);

CREATE INDEX idx_coupons_holder
    ON coupons(holder_id, is_redeemed);

-- ─── Photos ─────────────────────────────────────────────────────────────────

CREATE TABLE photos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    uploader_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path    TEXT NOT NULL,
    thumbnail_path  TEXT,
    caption         TEXT,
    taken_at        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_photos_couple_created
    ON photos(couple_id, created_at DESC);

-- ─── Notifications ──────────────────────────────────────────────────────────

CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id       UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
    recipient_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT,
    resource_id     TEXT,
    resource_type   TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_couple_created
    ON notifications(couple_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_unread
    ON notifications(recipient_id, is_read, created_at DESC);

-- ============================================================================
-- Row Level Security - Enable on all tables
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- ─── Profiles ───────────────────────────────────────────────────────────────

-- View own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
    USING (id = auth.uid());

-- View partner's profile (members of the same couple)
CREATE POLICY "profiles_select_partner" ON profiles FOR SELECT
    USING (
        id IN (
            SELECT user1_id FROM couples WHERE user2_id = auth.uid()
            UNION
            SELECT user2_id FROM couples WHERE user1_id = auth.uid()
        )
    );

-- Insert own profile
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
    WITH CHECK (id = auth.uid());

-- Update own profile
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ─── Couples ────────────────────────────────────────────────────────────────

-- View own couple
CREATE POLICY "couples_select" ON couples FOR SELECT
    USING (user1_id = auth.uid() OR user2_id = auth.uid());

-- Create couple (user1 is the creator)
CREATE POLICY "couples_insert" ON couples FOR INSERT
    WITH CHECK (user1_id = auth.uid());

-- Update own couple
CREATE POLICY "couples_update" ON couples FOR UPDATE
    USING (user1_id = auth.uid() OR user2_id = auth.uid())
    WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- ─── Timeline Posts ─────────────────────────────────────────────────────────

-- Couple members can view posts
CREATE POLICY "timeline_select" ON timeline_posts FOR SELECT
    USING (is_couple_member(couple_id));

-- Couple members can insert posts
CREATE POLICY "timeline_insert" ON timeline_posts FOR INSERT
    WITH CHECK (author_id = auth.uid() AND is_couple_member(couple_id));

-- Authors can update own posts
CREATE POLICY "timeline_update" ON timeline_posts FOR UPDATE
    USING (author_id = auth.uid())
    WITH CHECK (author_id = auth.uid());

-- Authors can delete own posts
CREATE POLICY "timeline_delete" ON timeline_posts FOR DELETE
    USING (author_id = auth.uid());

-- ─── Check-ins ──────────────────────────────────────────────────────────────

-- Couple members can view check-ins
CREATE POLICY "checkins_select" ON check_ins FOR SELECT
    USING (is_couple_member(couple_id));

-- Users can insert own check-ins
CREATE POLICY "checkins_insert" ON check_ins FOR INSERT
    WITH CHECK (user_id = auth.uid() AND is_couple_member(couple_id));

-- Users can update own check-ins
CREATE POLICY "checkins_update" ON check_ins FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ─── Wishes ─────────────────────────────────────────────────────────────────

-- Couple members can view wishes
CREATE POLICY "wishes_select" ON wishes FOR SELECT
    USING (is_couple_member(couple_id));

-- Couple members can insert wishes
CREATE POLICY "wishes_insert" ON wishes FOR INSERT
    WITH CHECK (author_id = auth.uid() AND is_couple_member(couple_id));

-- Couple members can update wishes (e.g., fulfill)
CREATE POLICY "wishes_update" ON wishes FOR UPDATE
    USING (is_couple_member(couple_id))
    WITH CHECK (is_couple_member(couple_id));

-- Authors can delete own wishes
CREATE POLICY "wishes_delete" ON wishes FOR DELETE
    USING (author_id = auth.uid());

-- ─── Love Letters ───────────────────────────────────────────────────────────

-- Couple members can view letters (author or recipient)
CREATE POLICY "letters_select" ON love_letters FOR SELECT
    USING (author_id = auth.uid() OR recipient_id = auth.uid());

-- Couple members can insert letters
CREATE POLICY "letters_insert" ON love_letters FOR INSERT
    WITH CHECK (author_id = auth.uid() AND is_couple_member(couple_id));

-- Recipients can update letters (mark as opened)
CREATE POLICY "letters_update" ON love_letters FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- ─── Coupons ────────────────────────────────────────────────────────────────

-- Couple members can view coupons
CREATE POLICY "coupons_select" ON coupons FOR SELECT
    USING (is_couple_member(couple_id));

-- Couple members can create coupons
CREATE POLICY "coupons_insert" ON coupons FOR INSERT
    WITH CHECK (creator_id = auth.uid() AND is_couple_member(couple_id));

-- Holder or creator can update coupons (redeem)
CREATE POLICY "coupons_update" ON coupons FOR UPDATE
    USING (holder_id = auth.uid() OR creator_id = auth.uid())
    WITH CHECK (holder_id = auth.uid() OR creator_id = auth.uid());

-- ─── Photos ─────────────────────────────────────────────────────────────────

-- Couple members can view photos
CREATE POLICY "photos_select" ON photos FOR SELECT
    USING (is_couple_member(couple_id));

-- Couple members can upload photos
CREATE POLICY "photos_insert" ON photos FOR INSERT
    WITH CHECK (uploader_id = auth.uid() AND is_couple_member(couple_id));

-- Uploaders can delete own photos
CREATE POLICY "photos_delete" ON photos FOR DELETE
    USING (uploader_id = auth.uid());

-- ─── Notifications ──────────────────────────────────────────────────────────

-- Recipients can view their notifications
CREATE POLICY "notifications_select" ON notifications FOR SELECT
    USING (recipient_id = auth.uid());

-- Couple members can insert notifications
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
    WITH CHECK (is_couple_member(couple_id));

-- Recipients can update notifications (mark as read)
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
    USING (recipient_id = auth.uid())
    WITH CHECK (recipient_id = auth.uid());

-- ============================================================================
-- Auto-create profile on signup
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
