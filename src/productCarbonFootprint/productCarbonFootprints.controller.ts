import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { PublicHiringTestLogger } from "../common/publicHiringTestLogger";
import { AuthenticationUserService } from "../security/authenticationUser.service";
import { CreateProductCarbonFootprintDto } from "./dto/create-productCarbonFootprint.dto";
import { CreateProductCarbonFootprintEvent } from "./event/create-productCarbonFootprint.event";
import { ProductCarbonFootprint } from "./productCarbonFootprint.entity";
import { ProductCarbonFootprintsService } from "./productCarbonFootprints.service";

@Controller("product-carbon-footprints")
export class ProductCarbonFootprintsController {
  constructor(
    private readonly productCarbonFootprintsService: ProductCarbonFootprintsService,
    private readonly authenticationUserService: AuthenticationUserService
  ) {}

  @Get()
  async getProductCarbonFootprints(
    @Req() request: Request
  ): Promise<ProductCarbonFootprint[]> {
    this.authenticationUserService.isGranted(request);

    // TODO: see on ./camille-notes.txt 'comment 6'
    // this.authorizationToken(request.token, 'getProductCarbonFootprints')

    // Hypothesis the request format is url/route?names=poduct1,product2
    const searchedNames: string[] = this.getSearchedNames(
      request.query.names as string
    );

    PublicHiringTestLogger.log(
      `[product-carbon-footprint] [GET] ProductCarbonFootprint: getting ProductCarbonFootprints for name= ${searchedNames}`
    );

    if (!this.isValidSearchedNames(searchedNames)) {
      return await Promise.resolve([]);
    }
    try {
      return await this.productCarbonFootprintsService.findByName(
        searchedNames
      );
    } catch (e) {
      const error = e as Error;
      PublicHiringTestLogger.error(
        `[product-carbon-footprint] [GET] ProductCarbonFootprint: An error occured: ${error.message}`
      );
      throw new InternalServerErrorException("Internal server error", {
        cause: error,
        description: error.message,
      });
    }
  }

  @Post()
  async createProductCarbonFootprints(
    @Req() request: Request,
    @Body() productCarbonFootprintEvents: CreateProductCarbonFootprintEvent[]
  ): Promise<ProductCarbonFootprint[] | null> {
    ``;
    PublicHiringTestLogger.log(
      `[product-carbon-footprint] [POST] ProductCarbonFootprint: ${JSON.stringify(productCarbonFootprintEvents)} created`
    );
    this.authenticationUserService.isGranted(request);

    // TODO: see on ./camille-notes.txt 'comment 6'
    // this.authorizationToken(request.token, 'getProductCarbonFootprints')
    try {
      const productCarbonFootprints: CreateProductCarbonFootprintDto[] =
        this.parseAndValidPayload(productCarbonFootprintEvents);

      if (productCarbonFootprints.length === 0) {
        PublicHiringTestLogger.error(
          `[product-carbon-footprint] [POST] ProductCarbonFootprint: 'Payload is missing'`
        );
        throw new BadRequestException("Payload data is not correct", {
          cause: new Error("Payload is missing"),
          description: "Payload is missing",
        });
      }

      return await this.productCarbonFootprintsService.computeAndSave(
        productCarbonFootprints
      );
    } catch (e) {
      const error = e as Error;
      PublicHiringTestLogger.error(
        `[product-carbon-footprint] [POST] ProductCarbonFootprint: An error occured: ${error.message}`
      );
      throw new InternalServerErrorException("Internal server error", {
        cause: error,
        description: error.message,
      });
    }
  }

  private parseAndValidPayload(
    productCarbonFootprints: CreateProductCarbonFootprintEvent[]
  ): CreateProductCarbonFootprintDto[] {
    // TODO: see on ./camille-notes.txt 'comment 7'
    try {
      return productCarbonFootprints.map((productCarbonFootprint) => {
        return ProductCarbonFootprint.fromJSON(productCarbonFootprint);
      });
    } catch (error) {
      PublicHiringTestLogger.error(
        `[product-carbon-footprint] [POST] ProductCarbonFootprint: 'Payload data is not correct'`
      );
      throw error;
    }
  }

  private getSearchedNames(names: string): string[] {
    return names && names !== "" ? names.split(",") : [];
  }

  private isValidSearchedNames(searchedNames: string[]): boolean {
    return (
      searchedNames && searchedNames.length !== 0 && searchedNames[0] !== ""
    );
  }
}
