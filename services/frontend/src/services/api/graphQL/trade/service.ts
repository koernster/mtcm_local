import client from '../client';
import { UPDATE_TRADE, INSERT_TRADE } from './mutations';
import { GET_ISINS_TRADES_FOR_BUYSELL } from './queries/getIsinsTradesForBuySell';
import { 
    Trade,
    TradeUpdate,
    TradeInsert,
    UpdateTradeVariables,
    UpdateTradeData,
    InsertTradeVariables,
    InsertTradeData,
    BuySellTradeData,
    BuySellTradesResponse,
    BuySellTradesVariables
} from './types/trade';

class TradeService {
    private static instance: TradeService;

    private constructor() {}

    public static getInstance(): TradeService {
        if (!TradeService.instance) {
            TradeService.instance = new TradeService();
        }
        return TradeService.instance;
    }

    /**
     * Update an existing trade (only for subscription trantype trades)
     * Automatically sets trantype to modified (2) when updating
     */
    async updateTrade(id: string, updateData: TradeUpdate): Promise<Trade> {
        try {
            // Automatically set trantype to modified (2) when updating
            const dataToUpdate: TradeUpdate = {
                ...updateData
            };

            if(dataToUpdate.transtatus != 3) {
                dataToUpdate.transtatus = 2; // Set to modified if not deleted
            }

            const { data } = await client.mutate<UpdateTradeData, UpdateTradeVariables>({
                mutation: UPDATE_TRADE,
                variables: {
                    id,
                    data: dataToUpdate
                }
            });

            if (!data?.update_trades_by_pk) {
                throw new Error('Failed to update trade');
            }

            return data.update_trades_by_pk;
        } catch (error) {
            console.error('Error updating trade:', error);
            throw error;
        }
    }

    /**
     * Save (insert) a new trade
     * @param tradeData - The trade data to insert
     * @returns The created trade
     */
    async saveTrade(tradeData: TradeInsert): Promise<Trade> {
        try {
            // Set default transtatus to subscription (1) if not provided
            const variables: InsertTradeVariables = {
                id: tradeData.id,
                bank_investor: tradeData.bank_investor,
                counterparty: tradeData.counterparty,
                isinid: tradeData.isinid,
                notional: tradeData.notional,
                price_dirty: tradeData.price_dirty,
                reference: tradeData.reference,
                tranfee: tradeData.tranfee,
                tradedate: tradeData.tradedate,
                valuedate: tradeData.valuedate,
                transtatus: tradeData.transtatus || 1,
                tradetype: tradeData.tradetype
            };

            const { data } = await client.mutate<InsertTradeData, InsertTradeVariables>({
                mutation: INSERT_TRADE,
                variables
            });

            if (!data?.insert_trades_one) {
                throw new Error('Failed to save trade');
            }

            return data.insert_trades_one;
        } catch (error) {
            console.error('Error saving trade:', error);
            throw error;
        }
    }

    /**
     * Loads trades data for a specific ISIN for Buy/Sell operations
     * @param isinid - The ISIN ID to load trades for
     * @returns Array of flattened trade data
     */
    async getIsinsTradesForBuySell(isinid: string): Promise<BuySellTradeData[]> {
        try {
            const { data } = await client.query<BuySellTradesResponse, BuySellTradesVariables>({
                query: GET_ISINS_TRADES_FOR_BUYSELL,
                variables: { isinid },
                fetchPolicy: 'network-only'
            });

            // Flatten the trade data structure for easier consumption
            return data.trades.map(trade => ({
                id: trade.id,
                tradetypeId: trade.tradetypeByTradetype.id,
                tradetypeName: trade.tradetypeByTradetype.typename,
                tradedate: trade.tradedate,
                valuedate: trade.valuedate,
                notional: trade.notional,
                price_dirty: trade.price_dirty,
                tranfee: trade.tranfee,
                counterparty: trade.counterparty,
                bank_investor: trade.bank_investor,
                reference: trade.reference,
                sales: trade.sales,
                createdat: trade.createdat
            }));
        } catch (error) {
            console.error('Error fetching trades for buy/sell:', error);
            throw error;
        }
    }

    async bulkUploadTrades(
        inserts: TradeInsert[],
        updates: { id: string; data: TradeUpdate }[]
    ): Promise<void> {
        try {
            //save each in loop.
            for (const insert of inserts) {
                 await this.saveTrade(insert);
            }

            //update each in loop.
            for (const update of updates) {
                 await this.updateTrade(update.id, update.data);
            }
        } catch (error) {
            console.error('Error in bulk upload:', error);
            throw error;
        }
    }
}

export default TradeService.getInstance();