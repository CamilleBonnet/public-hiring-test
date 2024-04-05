import {
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { Request } from "express";
import { GreenlyDataSource, dataSource } from "../../config/dataSource";
import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { AuthenticationUserService } from "../security/authenticationUser.service";
import { getProductCarbonFootprint } from "../seed-dev-data";
import {
  CreateProductCarbonFootprintEvent,
  IngredientsType,
} from "./event/create-productCarbonFootprint.event";
import { ProductCarbonFootprint } from "./productCarbonFootprint.entity";
import { ProductCarbonFootprintsController } from "./productCarbonFootprints.controller";
import { ProductCarbonFootprintsService } from "./productCarbonFootprints.service";

let productCarbonFootprintsController: ProductCarbonFootprintsController;
let productCarbonFootprintsService: ProductCarbonFootprintsService;

const hamAndCheesePizzaCarbonFootPrint: ProductCarbonFootprint =
  getProductCarbonFootprint("hamAndCheesePizza");

const request = { headers: "fake headers" };

describe("ProductCarbonFootprintsController", () => {
  beforeAll(async () => {
    await dataSource.initialize();
    productCarbonFootprintsService = new ProductCarbonFootprintsService(
      dataSource.getRepository(ProductCarbonFootprint),
      new CarbonEmissionFactorsService(
        dataSource.getRepository(CarbonEmissionFactor)
      )
    );
    productCarbonFootprintsController = new ProductCarbonFootprintsController(
      productCarbonFootprintsService,
      new AuthenticationUserService()
    );
  });

  beforeEach(async () => {
    await GreenlyDataSource.cleanDatabase();
  });

  describe("getProductCarbonFootprints", () => {
    it("returns the only productFootPrint required", async () => {
      const expectedResult = await Promise.resolve([
        hamAndCheesePizzaCarbonFootPrint,
      ]);

      jest
        .spyOn(productCarbonFootprintsService, "findByName")
        .mockImplementation(async () => expectedResult);

      const result: ProductCarbonFootprint[] =
        await productCarbonFootprintsController.getProductCarbonFootprints({
          ...request,
          query: { names: "hamAndCheesePizza" },
        } as unknown as Request);

      expect(result).toEqual(expectedResult);
    });

    it("returns all the availableproductFootPrint required", async () => {
      const expectedResult = await Promise.resolve([
        getProductCarbonFootprint("hamAndCheesePizza"),
        getProductCarbonFootprint("beefAndTomato"),
      ]);

      jest
        .spyOn(productCarbonFootprintsService, "findByName")
        .mockImplementation(async () => expectedResult);

      const result: ProductCarbonFootprint[] =
        await productCarbonFootprintsController.getProductCarbonFootprints({
          ...request,
          query: { names: "hamAndCheesePizza,beefAndTomato,couscous" },
        } as unknown as Request);

      expect(result).toEqual(expectedResult);
    });

    it("returns empty array if no names are given", async () => {
      const expectedResult = await Promise.resolve([]);

      jest
        .spyOn(productCarbonFootprintsService, "findByName")
        .mockImplementation(async () => expectedResult);

      const result: ProductCarbonFootprint[] =
        await productCarbonFootprintsController.getProductCarbonFootprints({
          ...request,
          query: { names: "" },
        } as unknown as Request);

      expect(result).toEqual(expectedResult);
    });

    it("returns empty array if names key is missing", async () => {
      const expectedResult = await Promise.resolve([]);

      jest
        .spyOn(productCarbonFootprintsService, "findByName")
        .mockImplementation(async () => expectedResult);

      const result: ProductCarbonFootprint[] =
        await productCarbonFootprintsController.getProductCarbonFootprints({
          ...request,
          query: {},
        } as unknown as Request);

      expect(result).toEqual(expectedResult);
    });

    it("throws an error if an error occur in the process", async () => {
      const error = new Error("bla bla bla");
      jest
        .spyOn(productCarbonFootprintsService, "findByName")
        .mockImplementation(async () => await Promise.reject(error));

      await expect(async () => {
        await productCarbonFootprintsController.getProductCarbonFootprints({
          ...request,
          query: { names: "hamAndCheesePizza" },
        } as unknown as Request);
      }).rejects.toThrow(
        new InternalServerErrorException("Internal server error", {
          cause: error,
          description: error.message,
        })
      );
    });
  });

  describe("createProductCarbonFootprints", () => {
    it("returns productFootPrint with computed score", async () => {
      const expectedResult: ProductCarbonFootprint[] = await Promise.resolve([
        hamAndCheesePizzaCarbonFootPrint,
      ]);
      expectedResult[0].score = 0.22;

      jest
        .spyOn(productCarbonFootprintsService, "computeAndSave")
        .mockImplementation(async () => expectedResult);

      const result: ProductCarbonFootprint[] | null =
        await productCarbonFootprintsController.createProductCarbonFootprints(
          request as unknown as Request,
          [
            {
              ...hamAndCheesePizzaCarbonFootPrint,
              ingredients: hamAndCheesePizzaCarbonFootPrint.ingredientsAsJSON,
            },
          ]
        );

      expect(result).toEqual(await expectedResult);
    });

    it("throws an error if no data is given in the payload", async () => {
      await expect(async () => {
        await productCarbonFootprintsController.createProductCarbonFootprints(
          request as unknown as Request,
          []
        );
      }).rejects.toThrow(
        new InternalServerErrorException("Internal server error", {
          cause: new BadRequestException("Payload data is not correct", {
            cause: new Error("Payload is missing"),
            description: "Payload is missing",
          }),
          description: "Payload is missing",
        })
      );
    });

    it("throws an error if data send is not correct", async () => {
      const incorrectHamAndCheesePizzaCarbonFootPrint: CreateProductCarbonFootprintEvent =
        {
          name: "",
          ingredients: [
            { name: "ham", quantity: 0.1, unit: "kg" },
            { name: "cheese", quantity: 0.15, unit: "kg" },
            { quantity: 0.4, unit: "kg" },
            { name: "flour", quantity: 0.7, unit: "kg" },
            { name: "oliveOil", quantity: 0.3, unit: "kg" },
          ] as IngredientsType[],
        };

      await expect(async () => {
        await productCarbonFootprintsController.createProductCarbonFootprints(
          request as unknown as Request,
          [incorrectHamAndCheesePizzaCarbonFootPrint]
        );
      }).rejects.toThrow(
        new InternalServerErrorException("Internal server error", {
          cause: new Error("Name cannot be empty"),
          description: "Payload is missing",
        })
      );
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
