-- Create buy_trade_on_issue view
-- This view joins trades with caseisins to enable filtering trades by caseid
-- Filters for buy trades (tradetype = 2)

CREATE OR REPLACE VIEW buy_trade_on_issue AS
SELECT 
    t.id,
    t.isinid,
    ci.caseid,
    t.tradetype,
    t.tradedate,
    t.valuedate,
    t.counterparty,
    t.bank_investor,
    t.reference,
    t.sales,
    t.notional,
    t.price_dirty,
    t.tranfee,
    t.transtatus,
    t.createdat,
    t.updatedat,
    t.reofferprice,
    t.discount
FROM trades t
JOIN caseisins ci ON t.isinid = ci.id
WHERE t.tradetype = 2;

COMMENT ON VIEW buy_trade_on_issue IS 'View of buy trades (tradetype=2) with caseid from caseisins join';
