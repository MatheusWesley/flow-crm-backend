-- Migration: Make CPF field optional in customers table
-- Date: 2024-10-29

-- Remove NOT NULL constraint from cpf column
ALTER TABLE customers ALTER COLUMN cpf DROP NOT NULL;

-- Update any existing empty CPF values to NULL for consistency
UPDATE customers SET cpf = NULL WHERE cpf = '';

-- Add comment to document the change
COMMENT ON COLUMN customers.cpf IS 'Customer CPF - Optional field, can be NULL';