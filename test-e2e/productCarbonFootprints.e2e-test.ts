import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { dataSource } from "../config/dataSource";
import { AppModule } from "../src/app.module";
import { ProductCarbonFootprint } from "../src/productCarbonFootprint/productCarbonFootprint.entity";

import * as request from "supertest";
import { CarbonEmissionFactor } from "../src/carbonEmissionFactor/carbonEmissionFactor.entity";
import {
  PRODUCTS,
  getProductCarbonFootprint,
  getTestEmissionFactor,
} from "../src/seed-dev-data";

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe("ProductCarbonFootprintsController", () => {
  let app: INestApplication;
  let defaultProductCarbonFootprints: ProductCarbonFootprint[];

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await dataSource.getRepository(ProductCarbonFootprint).save(
      PRODUCTS.map((product) => {
        return getProductCarbonFootprint(product.name);
      })
    );

    defaultProductCarbonFootprints = await dataSource
      .getRepository(ProductCarbonFootprint)
      .find();
  });

  it(`GET /product-carbon-footprints`, async () => {
    const url: string = "/product-carbon-footprints";

    return request(app.getHttpServer())
      .get(url)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual([]);
      });
  });

  it(`GET /product-carbon-footprints?names=name1,name2,name3`, async () => {
    const url: string = `/product-carbon-footprints?names=${PRODUCTS.map((p) => p.name)}`;

    return request(app.getHttpServer())
      .get(url)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(defaultProductCarbonFootprints);
      });
  });

  it("POST /product-carbon-footprints", async () => {
    await dataSource
      .getRepository(CarbonEmissionFactor)
      .save(
        ["ham", "cheese", "tomato", "flour", "oliveOil"].map((ingredient) =>
          getTestEmissionFactor(ingredient)
        )
      );

    const productCarbonFootprintEvent = {
      name: "hamAndCheesePizza",
      ingredients: [
        { name: "ham", quantity: 0.1, unit: "kg" },
        { name: "cheese", quantity: 0.15, unit: "kg" },
        { name: "tomato", quantity: 0.4, unit: "kg" },
        { name: "flour", quantity: 0.7, unit: "kg" },
        { name: "oliveOil", quantity: 0.3, unit: "kg" },
      ],
    };

    return request(app.getHttpServer())
      .post("/product-carbon-footprints")
      .send([productCarbonFootprintEvent])
      .expect(201)
      .expect(({ body }) => {
        expect(body.length).toEqual(1);
        expect(body[0]).toMatchObject({
          ...productCarbonFootprintEvent,
          ingredients: JSON.stringify(productCarbonFootprintEvent.ingredients),
          score: 0.22,
        });
      });
  });
});
