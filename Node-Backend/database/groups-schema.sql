-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group-User junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS group_user (
    group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON groups(is_active);
CREATE INDEX IF NOT EXISTS idx_groups_name ON groups(name);
CREATE INDEX IF NOT EXISTS idx_group_user_group_id ON group_user(group_id);
CREATE INDEX IF NOT EXISTS idx_group_user_user_id ON group_user(user_id);

-- RLS Policies for groups table
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view groups they are members of
CREATE POLICY "Users can view groups they are members of" ON groups
    FOR SELECT USING (
        id IN (
            SELECT group_id FROM group_user WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can create groups
CREATE POLICY "Users can create groups" ON groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Group members can update their groups
CREATE POLICY "Group members can update their groups" ON groups
    FOR UPDATE USING (
        id IN (
            SELECT group_id FROM group_user WHERE user_id = auth.uid()
        )
    );

-- Policy: Group members can delete their groups
CREATE POLICY "Group members can delete their groups" ON groups
    FOR DELETE USING (
        id IN (
            SELECT group_id FROM group_user WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for group_user table
ALTER TABLE group_user ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view group memberships for groups they are in
CREATE POLICY "Users can view group memberships" ON group_user
    FOR SELECT USING (
        group_id IN (
            SELECT group_id FROM group_user WHERE user_id = auth.uid()
        )
    );

-- Policy: Users can add themselves to groups
CREATE POLICY "Users can add themselves to groups" ON group_user
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy: Users can remove themselves from groups
CREATE POLICY "Users can remove themselves from groups" ON group_user
    FOR DELETE USING (user_id = auth.uid());

-- Policy: Group members can add other users to their groups
CREATE POLICY "Group members can add other users" ON group_user
    FOR INSERT WITH CHECK (
        group_id IN (
            SELECT group_id FROM group_user WHERE user_id = auth.uid()
        )
    );

-- Policy: Group members can remove other users from their groups
CREATE POLICY "Group members can remove other users" ON group_user
    FOR DELETE USING (
        group_id IN (
            SELECT group_id FROM group_user WHERE user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_groups_updated_at 
    BEFORE UPDATE ON groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 