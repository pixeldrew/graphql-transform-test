const { loadSchema } = require("@graphql-tools/load");
const { graphql, print } = require("graphql");

const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { TransformObjectFields } = require("@graphql-tools/wrap");
const { stitchSchemas } = require("@graphql-tools/stitch");

const transformFooToBar = (typeName, fieldName, fieldConfig) => {
  console.log(typeName, fieldName);
  let newFieldName = fieldName;
  if (fieldName === "foos") {
    newFieldName = "bars";
  }
  return [newFieldName, fieldConfig];
};

async function main() {
  const clientSchema1 = await loadSchema("./src/schema1.graphql", {
    loaders: [new GraphQLFileLoader()]
  });

  const clientSchema2 = await loadSchema("./src/schema2.graphql", {
    loaders: [new GraphQLFileLoader()]
  });

  const executor = ({ document, context }) => ({
    data: { bars: [] },
    errors: []
  });

  const schema = stitchSchemas({
    subschemas: [
      {
        schema: clientSchema1,
        transforms: [new TransformObjectFields(transformFooToBar)],
        executor
      },
      {
        schema: clientSchema2,
        transforms: [new TransformObjectFields(transformFooToBar)],
        executor
      }
    ]
  });
  const source = `query { bars { name id} }`;
  const result = await graphql({ schema, source, variableValues: {} });

  console.log(JSON.stringify(result, null, 4));
}

main().catch((e) => console.error(e));
