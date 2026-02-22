import client from '../client';
import { GET_SUBSCRIPTION_TRADES } from './queries/getSubscriptionTrades';
import { 
    SubscriptionTrade,
    SubscriptionTradesData, 
    SubscriptionTradesVariables 
} from './types/subscriptionTrades';

class SubscriptionTradeService {
    private static instance: SubscriptionTradeService;

    private constructor() {}

    public static getInstance(): SubscriptionTradeService {
        if (!SubscriptionTradeService.instance) {
            SubscriptionTradeService.instance = new SubscriptionTradeService();
        }
        return SubscriptionTradeService.instance;
    }

    public async getSubscriptionTradesByCaseId(caseId: string): Promise<{ currentTrades: SubscriptionTrade[], soldTrades: SubscriptionTrade[] }> {
        const { data } = await client.query<SubscriptionTradesData, SubscriptionTradesVariables>({
            query: GET_SUBSCRIPTION_TRADES,
            variables: { caseId },
            fetchPolicy: 'network-only'
        });
        return {
            currentTrades: data.currentTrades,
            soldTrades: data.soldTrades
        };
    }
}

export default SubscriptionTradeService;
