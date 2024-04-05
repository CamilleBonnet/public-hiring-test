import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Raw, Repository } from "typeorm";
import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { CreateProductCarbonFootprintDto } from "./dto/create-productCarbonFootprint.dto";
import { IngredientsType } from "./event/create-productCarbonFootprint.event";
import { ProductCarbonFootprint } from "./productCarbonFootprint.entity";

@Injectable()
export class ProductCarbonFootprintsService {
  constructor(
    @InjectRepository(ProductCarbonFootprint)
    private productCarbonFootprintRepository: Repository<ProductCarbonFootprint>,
    private readonly carbonEmissionFactorsService: CarbonEmissionFactorsService
  ) {}

  async save(
    productCarbonFootprint: CreateProductCarbonFootprintDto[]
  ): Promise<ProductCarbonFootprint[] | null> {
    return await this.productCarbonFootprintRepository.save(
      productCarbonFootprint
    );
  }

  async findByName(names: string[]): Promise<ProductCarbonFootprint[]> {
    if (names.length === 0) {
      return Promise.resolve([]);
    }

    return await this.productCarbonFootprintRepository.findBy({
      name: Raw((alias) => `${alias} IN (:...names)`, { names }),
    });
  }

  async compute(
    productCarbonFootprints: CreateProductCarbonFootprintDto[]
  ): Promise<CreateProductCarbonFootprintDto[]> {
    const allIngredients = this.getProductCarbonFootprintIngredientsName(
      productCarbonFootprints
    );

    const carbonEmissionFactors: CarbonEmissionFactor[] =
      await this.carbonEmissionFactorsService.findByName(allIngredients);

    return productCarbonFootprints.map((productCarbonFootprint) => {
      const score: number | null = this.computeProcuctCarbonFootprintScrore(
        productCarbonFootprint,
        carbonEmissionFactors
      );

      productCarbonFootprint.score = score
        ? parseFloat(score.toFixed(2))
        : null;

      return productCarbonFootprint;
    });
  }

  async computeAndSave(
    productCarbonFootprints: CreateProductCarbonFootprintDto[]
  ): Promise<ProductCarbonFootprint[] | null> {
    return await this.productCarbonFootprintRepository.save(
      await this.compute(productCarbonFootprints)
    );
  }

  private computeProcuctCarbonFootprintScrore(
    productCarbonFootprint: CreateProductCarbonFootprintDto,
    carbonEmissionFactors: CarbonEmissionFactor[]
  ): number | null {
    const productCarbonFootprintIngredientsName: string[] =
      this.getProductCarbonFootprintIngredientsName([productCarbonFootprint]);

    // if a factor of at least one ingredient is missing, return null
    if (
      productCarbonFootprintIngredientsName.some(
        (productCarbonFootprintIngredientName) => {
          return !carbonEmissionFactors
            .map((cEF) => cEF.name)
            .includes(productCarbonFootprintIngredientName);
        }
      )
    ) {
      return null;
    }

    const initScore: number = 0;
    return this.getProductCarbonFootprintIngredients([
      productCarbonFootprint,
    ]).reduce<number>((accumulator, productCarbonFootprintIngredient) => {
      const carbonEmissionFactorForIngredient = carbonEmissionFactors.filter(
        (carbonEmissionFactor) =>
          carbonEmissionFactor.name === productCarbonFootprintIngredient.name
      )[0];

      return (
        accumulator +
        this.getScoreForIngredient(
          productCarbonFootprintIngredient,
          carbonEmissionFactorForIngredient
        )
      );
    }, initScore);
  }

  private getProductCarbonFootprintIngredientsName(
    productCarbonFootprints: CreateProductCarbonFootprintDto[]
  ): string[] {
    return [
      ...new Set(
        this.getProductCarbonFootprintIngredients(productCarbonFootprints).map(
          (productCarbonFootprint) => productCarbonFootprint.name
        )
      ),
    ];
  }

  private getProductCarbonFootprintIngredients(
    productCarbonFootprints: CreateProductCarbonFootprintDto[]
  ): IngredientsType[] {
    return productCarbonFootprints.flatMap((productCarbonFootprint) =>
      JSON.parse(productCarbonFootprint.ingredients)
    );
  }

  private getScoreForIngredient(
    ingredient: IngredientsType,
    carbonEmissionFactor: CarbonEmissionFactor
  ): number {
    let unitFactor: number = 1;

    if (ingredient.unit !== carbonEmissionFactor.unit) {
      unitFactor = ingredient.unit === "kg" ? 1000 : 1 / 1000;
    }

    return (
      carbonEmissionFactor.emissionCO2eInKgPerUnit *
      ingredient.quantity *
      unitFactor
    );
  }
}
