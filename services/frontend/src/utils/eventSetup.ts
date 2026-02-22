import { act } from "react";
import { generateUUID } from "../lib/generateUUID";
import { couponPaymentDates } from "./buySellCalculations";
import { EventTypes } from "../types/EventTypes";
import { BatchInsertEventInput } from "../services/api/graphQL/events";
import { CouponFrequencies } from "../types/CouponFrequencies";

export const setupEvents = (activeCaseId: string, issueDate: Date, maturityDate: Date, couponFrequency: string) : BatchInsertEventInput => {
    const eventDates = couponPaymentDates(issueDate, maturityDate, couponFrequency as CouponFrequencies);

    const predefinedEvents = [];

    //calculated issue date. if falles on weekend, move to next day.
    const issueDateDay = issueDate.getDay();
    if (issueDateDay === 6) { // Saturday
        issueDate.setDate(issueDate.getDate() + 2);
    } else if (issueDateDay === 0) { // Sunday
        issueDate.setDate(issueDate.getDate() + 1);
    }

    //*** By Issue Date.
    //1. UpdateCompartmentStatus on Issue Date event.
    predefinedEvents.push({
        id: generateUUID(),
        caseid: activeCaseId,
        cutoffdate: issueDate.toISOString(),
        t: EventTypes.UpdateCompartmentStatus
    });

    //2. CompartmentPhase2Issue a week before Issue Date event.
    predefinedEvents.push({
        id: generateUUID(),
        caseid: activeCaseId,
        cutoffdate: issueDate.toISOString(),
        t: EventTypes.CompartmentPhase2Issue
    });

    //3. CompartmentPhase2Issue a week before Issue Date event.
    predefinedEvents.push({
        id: generateUUID(),
        caseid: activeCaseId,
        cutoffdate: issueDate.toISOString(),
        t: EventTypes.LoanIssuance2Client
    });

    const eventDatesExceptIssueDate = eventDates.filter(date => date.toISOString() !== issueDate.toISOString());

    //*** By Coupon Dates.
    //1. UpdateCouponInterestRate Event.
    predefinedEvents.push(
        ...eventDatesExceptIssueDate.map(date => ({
            id: generateUUID(),
            caseid: activeCaseId,
            cutoffdate: date.toISOString(),
            t: EventTypes.UpdateCouponInterestRate
        }))
    );

    //2. InterestPayment Notification Event.
    predefinedEvents.push(...eventDates.map(date => {
        return  {
            id: generateUUID(),
            caseid: activeCaseId,
            cutoffdate: date.toISOString(),
            t: EventTypes.InterestPayment
        }
    }));

    //3. CouponPayment Notification Event.
    predefinedEvents.push(...eventDates.map(date => {
        return  {
            id: generateUUID(),
            caseid: activeCaseId,
            cutoffdate: date.toISOString(),
            t: EventTypes.CouponPayment
        }
    }));

    //4. Create Coupon Interest Payment Entry Event.
    predefinedEvents.push(
        ...eventDatesExceptIssueDate.map(date => {
            return  {
                id: generateUUID(),
                caseid: activeCaseId,
                cutoffdate: date.toISOString(),
                t: EventTypes.CreateCouponPaymentEntry
            }
        })
    );

    //***Maturity Date
    //1. MaturityPayment a week before Issue Date event.
    predefinedEvents.push({
        id: generateUUID(),
        caseid: activeCaseId,
        cutoffdate: maturityDate.toISOString(),
        t: EventTypes.MaturityPayment
    });

    //2. UpdateCompartmentStatus2Maturity a week before Issue Date event.
    predefinedEvents.push({
        id: generateUUID(),
        caseid: activeCaseId,
        cutoffdate: maturityDate.toISOString(),
        t: EventTypes.UpdateCompartmentStatus2Maturity
    });
   
    //3. CompartmentPhase2Maturity a week before Issue Date event.
    predefinedEvents.push({
        id: generateUUID(),
        caseid: activeCaseId,
        cutoffdate: maturityDate.toISOString(),
        t: EventTypes.CompartmentPhase2Maturity
    });

    //prepare batch events.
    const couponEvents: BatchInsertEventInput = {
        predefinedEventDates: predefinedEvents.map(x=>{
            return {
                id: x.id,
                caseid: x.caseid,
                cutoffdate: x.cutoffdate,
            }
        }),
        eventWithTypes: predefinedEvents.map(x=>{
            return {
                id: generateUUID(),
                eventid: x.id,
                typeid: x.t
            }
        })
    };

    return couponEvents;
};
