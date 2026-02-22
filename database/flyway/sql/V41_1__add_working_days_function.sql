-- V41.1__add_working_days_function.sql

-- Function: next_weekday
-- Adds a specified number of working days (Mon-Fri) to a given start date.
CREATE OR REPLACE FUNCTION next_weekday(input_date DATE)
RETURNS DATE AS $$
BEGIN
  -- If Saturday, add 2 days (to Monday)
  IF EXTRACT(DOW FROM input_date) = 6 THEN
    RETURN input_date + 2;
  -- If Sunday, add 1 day (to Monday)
  ELSIF EXTRACT(DOW FROM input_date) = 0 THEN
    RETURN input_date + 1;
  ELSE
    RETURN input_date;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;