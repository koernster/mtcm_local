-- Drop and recreate subscription_trades_view to ensure latest structure
DROP VIEW IF EXISTS subscription_trades_view;

CREATE VIEW subscription_trades_view AS 
SELECT
    t.id,
    c.id as case_id, -- added case_id to filter the view by case.
    ci.id AS isin_id, -- added isin_id to segrigate the trades by ISIN.
    t.tradedate,
    t.valuedate,
    t.counterparty,
    t.bank_investor,
    t.reference,
    t.sales,
    t.notional,
    t.reofferprice,
    t.price_dirty,
    t.discount,
    ci.issueprice,
    cf.salesfee,
    --subscription specific fields
    csd.distributionpaidbyinvs,
    csd.salesfeepaidbyinves,
    csd.salesnotpaidissuedate,
    csd.salesnotpaidmaturitydate,
    -- types
    tt.typename AS tradetype,
    trt.typename AS trantype,
    --trade rank to identify the latest trade per sales
    t.transtatus
FROM trades t
JOIN caseisins ci ON t.isinid = ci.id
JOIN cases c ON ci.caseid = c.id
LEFT JOIN casefees cf ON cf.caseid = c.id
LEFT JOIN casesubscriptiondata csd ON csd.caseid = c.id
LEFT JOIN tradetypes tt ON t.tradetype = tt.id
LEFT JOIN trantypes trt ON t.transtatus= trt.id
--loads only subscription trades which are not deleted
WHERE t.tradetype = 1
