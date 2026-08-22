import { VatandasRepository } from "./VatandasRepository";
import { LandRepository } from "./LandRepository";

export class UnitOfWork {
  private static _instance: UnitOfWork;
  
  public vatandas: VatandasRepository;
  public land: LandRepository;

  private constructor() {
    this.vatandas = new VatandasRepository();
    this.land = new LandRepository();
  }

  public static getInstance(): UnitOfWork {
    if (!UnitOfWork._instance) {
      UnitOfWork._instance = new UnitOfWork();
    }
    return UnitOfWork._instance;
  }
}

export const uow = UnitOfWork.getInstance();

