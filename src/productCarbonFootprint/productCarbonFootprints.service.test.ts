import { GreenlyDataSource, dataSource } from "../../config/dataSource";
import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import {
  TEST_CARBON_EMISSION_FACTORS,
  getProductCarbonFootprint,
} from "../seed-dev-data";
import { ProductCarbonFootprint } from "./productCarbonFootprint.entity";
import { ProductCarbonFootprintsService } from "./productCarbonFootprints.service";

let hamAndCheesePizza = getProductCarbonFootprint("hamAndCheesePizza");
let beefAndTomato = getProductCarbonFootprint("beefAndTomato");
let couscous = getProductCarbonFootprint("couscous");

let productCarbonFootprintsService: ProductCarbonFootprintsService;

beforeAll(async () => {
  await dataSource.initialize();
  productCarbonFootprintsService = new ProductCarbonFootprintsService(
    dataSource.getRepository(ProductCarbonFootprint),
    new CarbonEmissionFactorsService(
      dataSource.getRepository(CarbonEmissionFactor)
    )
  );
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
  await dataSource
    .getRepository(CarbonEmissionFactor)
    .save(TEST_CARBON_EMISSION_FACTORS);
});

describe("ProductCarbonFootprint.service", () => {
  // save
  it("should save new productCarbonFootprint", async () => {
    await productCarbonFootprintsService.save([
      hamAndCheesePizza,
      beefAndTomato,
      couscous,
    ]);

    const retrieveHamAndCheesePizzaFootprint = await dataSource
      .getRepository(ProductCarbonFootprint)
      .findOne({ where: { name: "hamAndCheesePizza" } });

    expect(retrieveHamAndCheesePizzaFootprint?.name).toBe("hamAndCheesePizza");
  });

  // findByName
  it("should retrieve emission Factors thanks to their name", async () => {
    await productCarbonFootprintsService.save([
      hamAndCheesePizza,
      beefAndTomato,
    ]);

    const retrieveProductFootprints =
      await productCarbonFootprintsService.findByName([
        "hamAndCheesePizza",
        "beefAndTomato",
      ]);
    expect(retrieveProductFootprints).toHaveLength(2);
  });

  it("should return empty array if no emission Factors are given", async () => {
    const retrieveProductFootprints =
      await productCarbonFootprintsService.findByName([]);
    expect(retrieveProductFootprints).toHaveLength(0);
  });

  // compute
  it("should compute the footprint score of a product", async () => {
    const result = await productCarbonFootprintsService.compute([
      hamAndCheesePizza,
    ]);

    expect(result[0].name).toBe("hamAndCheesePizza");
    expect(result[0].score).toEqual(0.22);
  });

  // computeAndSave
  it("should compute and save the footprint score of a product", async () => {
    await productCarbonFootprintsService.computeAndSave([hamAndCheesePizza]);

    const retrieveHamAndCheesePizzaFootprint = await dataSource
      .getRepository(ProductCarbonFootprint)
      .findOne({ where: { name: "hamAndCheesePizza" } });

    expect(retrieveHamAndCheesePizzaFootprint?.name).toBe("hamAndCheesePizza");
    expect(retrieveHamAndCheesePizzaFootprint?.score).toEqual(0.22);
  });

  it("should compute and save the footprint score of a product where ingredient has not the same unit", async () => {
    await productCarbonFootprintsService.computeAndSave([beefAndTomato]);

    const retrieveHamAndCheesePizzaFootprint = await dataSource
      .getRepository(ProductCarbonFootprint)
      .findOne({ where: { name: "beefAndTomato" } });
    expect(retrieveHamAndCheesePizzaFootprint?.name).toBe("beefAndTomato");
    expect(retrieveHamAndCheesePizzaFootprint?.score).toEqual(7.09);
  });

  it("should not compute but save the footprint score of a product where ingredient is missing", async () => {
    await productCarbonFootprintsService.computeAndSave([couscous]);

    const retrieveHamAndCheesePizzaFootprint = await dataSource
      .getRepository(ProductCarbonFootprint)
      .findOne({ where: { name: "couscous" } });
    expect(retrieveHamAndCheesePizzaFootprint?.name).toBe("couscous");
    expect(retrieveHamAndCheesePizzaFootprint?.score).toBeNull();
  });
});

afterEach(async () => {
  await dataSource.getRepository(ProductCarbonFootprint).delete({});
  await dataSource.getRepository(CarbonEmissionFactor).delete({});
});

afterAll(async () => {
  await dataSource.destroy();
});
