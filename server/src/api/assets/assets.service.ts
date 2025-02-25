import { type User } from '~/core/db/models/user.model';
import { PriceModel } from '~/core/db/models/price.model';

export class AssetsService {
  private static instance: AssetsService;

  private constructor() {}

  public static getInstance(): AssetsService {
    if (!AssetsService.instance) {
      AssetsService.instance = new AssetsService();
    }
    return AssetsService.instance;
  }

  async getAssetOverview(assetAddresses: string[]): Promise<any[]> {
    const priceModel = PriceModel.getInstance();
    // Get latest prices for all assets
    const priceData = await Promise.all(
      assetAddresses.map(async (address) => {
        const prices = await priceModel.findByAssetAddress(address, 1);
        return {
          asset_address: address,
          latest_price: prices[0]?.price || null,
          time: prices[0]?.time || null
        };
      })
    );
    return priceData;
  }
}
