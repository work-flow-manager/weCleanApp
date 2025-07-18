-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one review per job per customer
  CONSTRAINT unique_job_customer_review UNIQUE (job_id, customer_id)
);

-- Create review_responses table
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  responded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one response per review
  CONSTRAINT unique_review_response UNIQUE (review_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_responded_by ON review_responses(responded_by);

-- Add RLS policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;

-- Policy for customers to see their own reviews
CREATE POLICY customer_select_reviews ON reviews
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM customers
      WHERE id = reviews.customer_id
    )
  );

-- Policy for admins and managers to see all reviews
CREATE POLICY admin_manager_select_reviews ON reviews
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE role IN ('admin', 'manager')
    )
  );

-- Policy for team members to see reviews for jobs they're assigned to
CREATE POLICY team_select_reviews ON reviews
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT cm.profile_id FROM company_members cm
      JOIN job_assignments ja ON ja.team_member_id = cm.id
      WHERE ja.job_id = reviews.job_id
      AND cm.role = 'team'
    )
  );

-- Policy for customers to insert their own reviews
CREATE POLICY customer_insert_reviews ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM customers
      WHERE id = reviews.customer_id
    )
  );

-- Policy for customers to update their own reviews
CREATE POLICY customer_update_reviews ON reviews
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM customers
      WHERE id = reviews.customer_id
    )
  );

-- Policy for customers to delete their own reviews
CREATE POLICY customer_delete_reviews ON reviews
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM customers
      WHERE id = reviews.customer_id
    )
  );

-- Policy for admins to manage all reviews
CREATE POLICY admin_manage_reviews ON reviews
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE role = 'admin'
    )
  );

-- Policy for admins and managers to see all review responses
CREATE POLICY admin_manager_select_review_responses ON review_responses
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE role IN ('admin', 'manager')
    )
  );

-- Policy for customers to see responses to their reviews
CREATE POLICY customer_select_review_responses ON review_responses
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT c.profile_id FROM customers c
      JOIN reviews r ON r.customer_id = c.id
      WHERE r.id = review_responses.review_id
    )
  );

-- Policy for team members to see responses to reviews for jobs they're assigned to
CREATE POLICY team_select_review_responses ON review_responses
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT cm.profile_id FROM company_members cm
      JOIN job_assignments ja ON ja.team_member_id = cm.id
      JOIN reviews r ON r.job_id = ja.job_id
      WHERE r.id = review_responses.review_id
      AND cm.role = 'team'
    )
  );

-- Policy for admins and managers to insert review responses
CREATE POLICY admin_manager_insert_review_responses ON review_responses
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE role IN ('admin', 'manager')
    )
  );

-- Policy for admins and managers to update review responses
CREATE POLICY admin_manager_update_review_responses ON review_responses
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE role IN ('admin', 'manager')
    )
  );

-- Policy for admins to delete review responses
CREATE POLICY admin_delete_review_responses ON review_responses
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE role = 'admin'
    )
  );

-- Create function to update job rating when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION update_job_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL;
BEGIN
  -- Calculate the average rating for the job
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM reviews
  WHERE job_id = COALESCE(NEW.job_id, OLD.job_id);
  
  -- Update the job's rating
  UPDATE jobs
  SET 
    rating = avg_rating,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.job_id, OLD.job_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update job rating
CREATE TRIGGER update_job_rating_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_job_rating();

CREATE TRIGGER update_job_rating_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_job_rating();

CREATE TRIGGER update_job_rating_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_job_rating();

-- Create function to notify managers of new reviews
CREATE OR REPLACE FUNCTION notify_managers_of_review()
RETURNS TRIGGER AS $$
DECLARE
  job_record RECORD;
  manager_id UUID;
  company_id UUID;
BEGIN
  -- Get job details
  SELECT j.id, j.title, j.company_id, j.assigned_manager
  INTO job_record
  FROM jobs j
  WHERE j.id = NEW.job_id;
  
  -- Get company ID
  company_id := job_record.company_id;
  
  -- Get assigned manager if available
  manager_id := job_record.assigned_manager;
  
  -- If there's an assigned manager, notify them
  IF manager_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      related_id
    ) VALUES (
      manager_id,
      'review_received',
      'New Review Received',
      'A new review has been submitted for job ' || COALESCE(job_record.title, job_record.id::text),
      false,
      NEW.id
    );
  END IF;
  
  -- Notify all admins of the company
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    is_read,
    related_id
  )
  SELECT 
    cm.profile_id,
    'review_received',
    'New Review Received',
    'A new review has been submitted for job ' || COALESCE(job_record.title, job_record.id::text),
    false,
    NEW.id
  FROM company_members cm
  WHERE cm.company_id = company_id
  AND cm.role = 'admin'
  AND (manager_id IS NULL OR cm.profile_id != manager_id); -- Don't duplicate notifications
  
  -- If rating is low (1 or 2), mark as important
  IF NEW.rating <= 2 THEN
    -- Update the notifications to mark as important
    UPDATE notifications
    SET 
      title = 'Low Rating Review Received',
      is_important = true
    WHERE related_id = NEW.id
    AND type = 'review_received';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify managers of new reviews
CREATE TRIGGER notify_managers_after_review
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_managers_of_review();

-- Create function to notify customer of review response
CREATE OR REPLACE FUNCTION notify_customer_of_response()
RETURNS TRIGGER AS $$
DECLARE
  review_record RECORD;
  customer_profile_id UUID;
BEGIN
  -- Get review details and customer profile ID
  SELECT r.id, r.job_id, c.profile_id
  INTO review_record
  FROM reviews r
  JOIN customers c ON c.id = r.customer_id
  WHERE r.id = NEW.review_id;
  
  -- If customer has a profile, notify them
  IF review_record.customer_profile_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      is_read,
      related_id
    ) VALUES (
      review_record.customer_profile_id,
      'review_response',
      'Response to Your Review',
      'Your review has received a response',
      false,
      review_record.job_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to notify customer of review response
CREATE TRIGGER notify_customer_after_response
AFTER INSERT ON review_responses
FOR EACH ROW
EXECUTE FUNCTION notify_customer_of_response();