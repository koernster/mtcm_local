-- V43: Drop and recreate cron_event_executions view to ensure latest structure
DROP VIEW IF EXISTS cron_event_executions;

CREATE VIEW cron_event_executions AS 
SELECT DISTINCT
    ped.caseid,
    et.event,
    ped.cutoffdate,
    next_weekday(ped.cutoffdate::date) as weekdayof_cutoffdate,
    ec.cutoffdateschedule,
    next_weekday((ped.cutoffdate + (ec.cutoffdateschedule || ' days')::interval)::date) AS executiondate,
    --extra event config fields
    ec.title,
    ec.template,
    ec.target,
    ec.targettype,
    ec.graphql,
    et.execution_order,
    et.eventtypename
FROM predefinedeventdates ped
LEFT JOIN eventwithtypes ewt 
    ON ewt.eventid = ped.id
LEFT JOIN eventtypes et
    ON et.id = ewt.typeid
LEFT JOIN eventconfig ec
    ON ec.eventtypeid = et.id
WHERE 
    -- where cutoffdate between 30 days from today.
    cutoffdate BETWEEN NOW()::date AND (NOW() + INTERVAL '30 days')::date
ORDER BY ped.cutoffdate, et.execution_order