const { loadSchema } = require("@graphql-tools/load");
const { graphql, print } = require("graphql");

const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const { stitchSchemas } = require("@graphql-tools/stitch");

class TransformSchema {
  transformSchema(originalWrappingSchema) {
    console.log('TransformSchema');
    return originalWrappingSchema;
  }

  transformRequest(originalRequest) {
    return originalRequest;
  }
}

async function main() {
  const clientSchema1 = await loadSchema("./src/schema1.graphql", {
    loaders: [new GraphQLFileLoader()]
  });

  const clientSchema2 = await loadSchema("./src/schema2.graphql", {
    loaders: [new GraphQLFileLoader()]
  });

  const executor = ({ document, context }) => ({
    data: { foos: [] },
    errors: []
  });

  const schema = stitchSchemas({
    subschemas: [
      {
        schema: clientSchema1,
        transforms: [new TransformSchema()],
        executor
      },
      {
        schema: clientSchema2,
        executor
      }
    ]
  });
  const source = `query { foos { name id} }`;
  const result = await graphql({ schema, source, variableValues: {} });

  console.log(JSON.stringify(result, null, 4));
}

main().catch((e) => console.error(e));
