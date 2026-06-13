-- Contact requests table (sender → receiver, must be accepted)
CREATE TABLE IF NOT EXISTS contact_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at timestamptz DEFAULT now(),
    UNIQUE(sender_id, receiver_id)
);

ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender can view own sent requests" ON contact_requests
    FOR SELECT USING (auth.uid() = sender_id);

CREATE POLICY "Receiver can view received requests" ON contact_requests
    FOR SELECT USING (auth.uid() = receiver_id);

CREATE POLICY "Users can send requests" ON contact_requests
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver can update status" ON contact_requests
    FOR UPDATE USING (auth.uid() = receiver_id);

CREATE POLICY "Sender can cancel request" ON contact_requests
    FOR DELETE USING (auth.uid() = sender_id);
