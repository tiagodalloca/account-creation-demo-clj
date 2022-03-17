import CoreStack from './core-stack';

export default function main(app) {
  // Set default runtime for all functions
  app.setDefaultFunctionProps({
    runtime: "nodejs14.x"
  });

  new CoreStack(app, "core-stack");

  // Add more stacks
}
