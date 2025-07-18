-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  notes TEXT,
  payment_terms TEXT,
  paid_amount DECIMAL(10, 2) DEFAULT 0,
  paid_date TIMESTAMP WITH TIME ZONE,
  payment_method VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_invoice_number_per_company UNIQUE (company_id, invoice_number)
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(10, 2),
  service_type_id UUID REFERENCES service_types(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create invoice_payments table
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(100),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create company_invoice_settings table for storing company-specific invoice settings
CREATE TABLE IF NOT EXISTS company_invoice_settings (
  company_id UUID PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  default_tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  default_payment_terms TEXT,
  invoice_prefix VARCHAR(10),
  invoice_footer TEXT,
  next_invoice_number INTEGER NOT NULL DEFAULT 1,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);

-- Add RLS policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_invoice_settings ENABLE ROW LEVEL SECURITY;

-- Policy for admins and managers to see all invoices for their company
CREATE POLICY admin_manager_select_invoices ON invoices
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE company_id = invoices.company_id 
      AND role IN ('admin', 'manager')
    )
  );

-- Policy for team members to see invoices for jobs they're assigned to
CREATE POLICY team_select_invoices ON invoices
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT cm.profile_id FROM company_members cm
      JOIN job_assignments ja ON ja.team_member_id = cm.id
      WHERE cm.company_id = invoices.company_id 
      AND ja.job_id = invoices.job_id
      AND cm.role = 'team'
    )
  );

-- Policy for customers to see their own invoices
CREATE POLICY customer_select_invoices ON invoices
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM customers
      WHERE id = invoices.customer_id
    )
  );

-- Policy for admins and managers to insert invoices
CREATE POLICY admin_manager_insert_invoices ON invoices
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE company_id = invoices.company_id 
      AND role IN ('admin', 'manager')
    )
  );

-- Policy for admins and managers to update invoices
CREATE POLICY admin_manager_update_invoices ON invoices
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE company_id = invoices.company_id 
      AND role IN ('admin', 'manager')
    )
  );

-- Similar policies for invoice_items
CREATE POLICY admin_manager_select_invoice_items ON invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN company_members cm ON cm.company_id = i.company_id
      WHERE i.id = invoice_items.invoice_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('admin', 'manager')
    )
  );

CREATE POLICY team_select_invoice_items ON invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN job_assignments ja ON ja.job_id = i.job_id
      JOIN company_members cm ON cm.id = ja.team_member_id
      WHERE i.id = invoice_items.invoice_id
      AND cm.profile_id = auth.uid()
      AND cm.role = 'team'
    )
  );

CREATE POLICY customer_select_invoice_items ON invoice_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN customers c ON c.id = i.customer_id
      WHERE i.id = invoice_items.invoice_id
      AND c.profile_id = auth.uid()
    )
  );

-- Similar policies for invoice_payments
CREATE POLICY admin_manager_select_invoice_payments ON invoice_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN company_members cm ON cm.company_id = i.company_id
      WHERE i.id = invoice_payments.invoice_id
      AND cm.profile_id = auth.uid()
      AND cm.role IN ('admin', 'manager')
    )
  );

-- Company invoice settings policies
CREATE POLICY admin_select_company_invoice_settings ON company_invoice_settings
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE company_id = company_invoice_settings.company_id 
      AND role = 'admin'
    )
  );

CREATE POLICY admin_update_company_invoice_settings ON company_invoice_settings
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT profile_id FROM company_members 
      WHERE company_id = company_invoice_settings.company_id 
      AND role = 'admin'
    )
  );

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT;
  next_num INTEGER;
  formatted_num TEXT;
BEGIN
  -- Get the company's invoice prefix and next number
  SELECT 
    COALESCE(invoice_prefix, ''), 
    next_invoice_number 
  INTO prefix, next_num
  FROM company_invoice_settings
  WHERE company_id = NEW.company_id;
  
  -- If no settings exist, create default settings
  IF next_num IS NULL THEN
    INSERT INTO company_invoice_settings (company_id, next_invoice_number)
    VALUES (NEW.company_id, 1)
    RETURNING next_invoice_number INTO next_num;
    
    prefix := '';
  END IF;
  
  -- Format the number with leading zeros (e.g., 000001)
  formatted_num := LPAD(next_num::TEXT, 6, '0');
  
  -- Set the invoice number
  NEW.invoice_number := prefix || formatted_num;
  
  -- Increment the next invoice number
  UPDATE company_invoice_settings
  SET next_invoice_number = next_invoice_number + 1,
      updated_at = NOW()
  WHERE company_id = NEW.company_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate invoice numbers
CREATE TRIGGER set_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
EXECUTE FUNCTION generate_invoice_number();

-- Create function to update invoice totals when items change
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  new_subtotal DECIMAL(10, 2);
  new_tax_amount DECIMAL(10, 2);
  invoice_tax_rate DECIMAL(5, 2);
BEGIN
  -- Calculate new subtotal
  SELECT COALESCE(SUM(amount), 0) INTO new_subtotal
  FROM invoice_items
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get the invoice tax rate
  SELECT tax_rate INTO invoice_tax_rate
  FROM invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Calculate new tax amount
  new_tax_amount := ROUND(new_subtotal * (invoice_tax_rate / 100), 2);
  
  -- Update the invoice
  UPDATE invoices
  SET 
    subtotal = new_subtotal,
    tax_amount = new_tax_amount,
    total_amount = new_subtotal + new_tax_amount,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update invoice totals when items are added, updated, or deleted
CREATE TRIGGER update_invoice_totals_after_insert
AFTER INSERT ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER update_invoice_totals_after_update
AFTER UPDATE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

CREATE TRIGGER update_invoice_totals_after_delete
AFTER DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_totals();

-- Create function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_paid DECIMAL(10, 2);
  invoice_total DECIMAL(10, 2);
  invoice_status VARCHAR(20);
BEGIN
  -- Calculate total paid amount
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM invoice_payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Get invoice total and current status
  SELECT total_amount, status INTO invoice_total, invoice_status
  FROM invoices
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update the invoice paid amount
  UPDATE invoices
  SET 
    paid_amount = total_paid,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update status to paid if fully paid and not already cancelled
  IF total_paid >= invoice_total AND invoice_status != 'cancelled' THEN
    UPDATE invoices
    SET 
      status = 'paid',
      paid_date = NOW(),
      updated_at = NOW()
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update invoice payment status
CREATE TRIGGER update_invoice_payment_status_after_insert
AFTER INSERT ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER update_invoice_payment_status_after_update
AFTER UPDATE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

CREATE TRIGGER update_invoice_payment_status_after_delete
AFTER DELETE ON invoice_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_payment_status();

-- Create function to check for overdue invoices
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS VOID AS $$
BEGIN
  UPDATE invoices
  SET 
    status = 'overdue',
    updated_at = NOW()
  WHERE 
    status = 'sent' AND 
    due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to check for overdue invoices daily
SELECT cron.schedule(
  'check-overdue-invoices',
  '0 0 * * *',  -- Run at midnight every day
  'SELECT check_overdue_invoices()'
);