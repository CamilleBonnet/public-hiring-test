import { GreenlyDataSource, dataSource } from "../../config/dataSource";
import { getTestEmissionFactor } from "../seed-dev-data";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "./carbonEmissionFactors.service";

let flourEmissionFactor = getTestEmissionFactor("flour");
let hamEmissionFactor = getTestEmissionFactor("ham");
let olivedOilEmissionFactor = getTestEmissionFactor("oliveOil");
let carbonEmissionFactorService: CarbonEmissionFactorsService;

beforeAll(async () => {
  await dataSource.initialize();
  carbonEmissionFactorService = new CarbonEmissionFactorsService(
    dataSource.getRepository(CarbonEmissionFactor)
  );
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
  await dataSource
    .getRepository(CarbonEmissionFactor)
    .save(olivedOilEmissionFactor);
});

describe("CarbonEmissionFactors.service", () => {
  // save
  it("should save new emissionFactors", async () => {
    await carbonEmissionFactorService.save([
      hamEmissionFactor,
      flourEmissionFactor,
    ]);
    const retrieveChickenEmissionFactor = await dataSource
      .getRepository(CarbonEmissionFactor)
      .findOne({ where: { name: "flour" } });
    expect(retrieveChickenEmissionFactor?.name).toBe("flour");
  });

  // findAll
  it("should retrieve emission Factors", async () => {
    const carbonEmissionFactors = await carbonEmissionFactorService.findAll();
    expect(carbonEmissionFactors).toHaveLength(1);
  });

  // findByName
  it("should retrieve emission Factors thanks to their name", async () => {
    await carbonEmissionFactorService.save([
      hamEmissionFactor,
      flourEmissionFactor,
    ]);

    const carbonEmissionFactors = await carbonEmissionFactorService.findByName([
      "flour",
      "oliveOil",
    ]);

    expect(carbonEmissionFactors).toHaveLength(2);
  });

  it("should return empty array if no emission Factors are given", async () => {
    const carbonEmissionFactors = await carbonEmissionFactorService.findByName(
      []
    );
    expect(carbonEmissionFactors).toHaveLength(0);
  });
});

afterEach(async () => {
  await dataSource.getRepository(CarbonEmissionFactor).delete({});
});

afterAll(async () => {
  await dataSource.destroy();
});
