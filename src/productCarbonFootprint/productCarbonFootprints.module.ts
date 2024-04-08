import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarbonEmissionFactorsModule } from "../carbonEmissionFactor/carbonEmissionFactors.module";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { AuthenticationUserService } from "../security/authenticationUser.service";
import { ProductCarbonFootprint } from "./productCarbonFootprint.entity";
import { ProductCarbonFootprintsController } from "./productCarbonFootprints.controller";
import { ProductCarbonFootprintsService } from "./productCarbonFootprints.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductCarbonFootprint]),
    CarbonEmissionFactorsModule,
  ],
  providers: [
    ProductCarbonFootprintsService,
    CarbonEmissionFactorsService,
    AuthenticationUserService,
  ],
  controllers: [ProductCarbonFootprintsController],
})
export class ProductCarbonFootprintsModule {}
