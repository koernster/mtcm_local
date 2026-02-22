-- Create table and function with proper cleanup
DO $$ 
BEGIN
    -- Create the reference table if it doesn't exist
    CREATE TABLE IF NOT EXISTS trades_history_by_days_output (
      valuedate DATE,
      net_notional NUMERIC,
      loan_cell INTEGER
    );
    
    -- Drop the function if it exists to avoid conflicts
    DROP FUNCTION IF EXISTS trades_history_by_days(UUID) CASCADE;
    
    -- Create the function returning SETOF table
    CREATE FUNCTION trades_history_by_days(p_isinid UUID)
    RETURNS SETOF trades_history_by_days_output AS $func$
BEGIN
  RETURN QUERY
  WITH base AS (
    SELECT
      t.valuedate::DATE,
      SUM(
        CASE
          WHEN t.tradetype = 2 THEN t.notional
          WHEN t.tradetype = 3 THEN -t.notional
          ELSE 0
        END
      ) AS net_notional,
      COUNT(*) AS cnt
    FROM trades t
    WHERE t.isinid = p_isinid
      AND t.tradetype IN (2, 3)
    GROUP BY t.valuedate::DATE
  ),
  with_flags AS (
    SELECT *,
      CASE
        WHEN LAG(cnt) OVER (ORDER BY valuedate) = cnt THEN 0
        ELSE 1
      END AS rank_flag
    FROM base
  ),
  final_ranked AS (
    SELECT *,
      SUM(rank_flag) OVER (ORDER BY valuedate ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rank
    FROM with_flags
  )
  SELECT 
    final_ranked.valuedate,
    final_ranked.net_notional,
    final_ranked.rank::INTEGER AS loan_cell
  FROM final_ranked
  ORDER BY final_ranked.valuedate;
END;
$func$ LANGUAGE plpgsql STABLE;
END $$;