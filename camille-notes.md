# Notes regarding code provided

## General Comments

This is the very first time I deal with NestJS framework. I use to work on a NodeJs environnment but we re-created from scratch our own framwork
So I'm not that familiar with the module initialization, the request decorator etc. but I think I could manage for this case.

During the development, I added `"strict": true` to the `tsconfig.ts` of the project, which had a big impact on the type etc. which adds more credits to the comment 7 for the controller (see below)

- Comment 1:

  - I did not fix it, but in every test I would mock the return form the repository to be able to have parallele tests that can "write" on the same table withoud disturbing the others
  - I modify the jest command by adding `--runInBand` to prevent all the flacky issues I was facing

- Comment 2:

  - I did a unit test of the controller to be able to cover it 100%.
  - This unit test mock the return of all the services
  - This tests is compmentary of the e2e test itself

- Comment 3:

  - I did not deal on purpose of the name uniqueness of a productCarbonFootprint because two product could have the same name but not same exact quantity and / or ingredients
  - Maybe a mistake of my part but I realized that at the end of producing this test

- Comment 4:
  - I did not modify a lot everything regarding carbonEmissionFactor entity, service and controller.
  - I apply good practice of code only on the part I had to do (async/await, controller test, try/catch etc)

## Comments for ./src/productCarbonFootprint/productCarbonFootprint.entity.ts

- Comment 5:
  - All the part of checking the JSON, and as well the `ingredientsAsJSON` method is there to go a bit faster but all this logic should be handle by:
    - the addition of another layer `ProductCarbonFootprintModel` that would have `IngredientType` type for ingredients
    - the addition of a transformers `...fromModelToEntity` and `...fromEntityToModel` manipulate and do the computation on the Model level and once it is done transform it into entity to provide to the repository

## Comments for ./src/productCarbonFootprint/productCarbonFootprints.controller.ts

- Comment 6:

  - Implement an authorization service to check if the user can do the action
  - This service throw new UnauthorizedException(...) error if the user can not do it

- Comment 7:

  - This should be in a transformer own class like productCarbonFootprintTransformer
  - This transformer whould take the payload as argument, would parse it and convert into Model (see comment above)
  - This transformer would call a static method from the Model class like ProductCarbonFootprintModel.fromJSON({...pCFEvent})
  - Once this model is validated and the computation done, we would transform it into Entity to provide to the service to save the data
  - I addition, we could use `class-validator` to validate any instance of a classe thanks to decorator
