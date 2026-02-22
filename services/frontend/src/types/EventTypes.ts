/**
 * Enum for Event Types with their corresponding UUID values
 */
export enum EventTypes {
  //Issue Date
  LoanIssuance2Client = 'a40e9b04-474d-462b-b4bb-7f54bfbd52df',
  UpdateCompartmentStatus = '550e8400-e29b-41d4-a716-446655440002',
  CompartmentPhase2Issue='2c692d25-5ea5-4200-862a-4f3a6bc7185c',

  //Coupon Date
  UpdateCouponInterestRate = '550e8400-e29b-41d4-a716-446655440001',
  InterestPayment = '268aee8d-a059-4e6f-b8cf-c3ce602a0474',
  CouponPayment='40b85844-0c7d-4da7-b153-e89e12c87a0e',
  CreateCouponPaymentEntry = '7482c692-4d54-4b4e-8e27-2ebdd7604789',

  //Maturity Date
  MaturityPayment = '5e5565af-3727-43e5-930e-423ce8c76184',
  UpdateCompartmentStatus2Maturity='af034520-fd7b-49b4-a740-181af2d7572a',
  CompartmentPhase2Maturity='ce4a76f8-c336-4be8-8be6-531deb11b0d1',
}