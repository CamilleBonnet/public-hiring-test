export type IngredientsType = {
  name: string;
  quantity: number;
  unit: string;
};

export class CreateProductCarbonFootprintEvent {
  name?: string;
  ingredients?: IngredientsType[];
  score?: number | null;
}
