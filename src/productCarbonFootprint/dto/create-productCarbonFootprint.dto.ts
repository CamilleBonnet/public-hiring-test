export class CreateProductCarbonFootprintDto {
  name: string;
  ingredients: string;
  score?: number | null;

  constructor(props: {
    name: string;
    ingredients: string;
    score?: number | null;
  }) {
    this.name = props?.name;
    this.ingredients = props.ingredients;
  }
}
