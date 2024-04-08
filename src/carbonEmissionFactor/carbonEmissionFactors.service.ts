import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Raw, Repository } from "typeorm";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { CreateCarbonEmissionFactorDto } from "./dto/create-carbonEmissionFactor.dto";

@Injectable()
export class CarbonEmissionFactorsService {
  constructor(
    @InjectRepository(CarbonEmissionFactor)
    private carbonEmissionFactorRepository: Repository<CarbonEmissionFactor>
  ) {}

  async findAll(): Promise<CarbonEmissionFactor[]> {
    return await this.carbonEmissionFactorRepository.find();
  }

  async save(
    carbonEmissionFactors: CreateCarbonEmissionFactorDto[]
  ): Promise<CarbonEmissionFactor[] | null> {
    return await this.carbonEmissionFactorRepository.save(
      carbonEmissionFactors
    );
  }

  async findByName(names: string[]): Promise<CarbonEmissionFactor[]> {
    if (names.length === 0) {
      return await Promise.resolve([]);
    }

    return await this.carbonEmissionFactorRepository.findBy({
      name: Raw((alias) => `${alias} IN (:...names)`, { names }),
    });
  }
}
