import 'reflect-metadata';
import { DEFAULT_RESOLVER } from './resolvers';

let argsResolver = DEFAULT_RESOLVER;

export function initSequelizeResolver(resolver) {
  argsResolver = resolver;
}

export function Transactional(target: any, functionName: string, descriptor: TypedPropertyDescriptor<Function>) {
  const className = target?.constructor?.name || "global";
  const indexOfTransaction = Reflect.getMetadata(metaKey(className, functionName), target, functionName);
  const hasTransactionParameter = indexOfTransaction != null;

  const originalMethod = descriptor.value;
  descriptor.value = async function() {
    const args = [...arguments];

    const isAlreadyInitialized = hasTransactionParameter && args[indexOfTransaction] != null;
    if (isAlreadyInitialized) {
      // the transaction object was initialized EXTERNALLY.
      return originalMethod.apply(this, args);
    }

    // use the resolver to create a LOCAL transaction.
    const sequelize = argsResolver(functionName, args);
    const transaction = await sequelize.transaction();
    try {
      if (hasTransactionParameter) args[indexOfTransaction] = transaction;
      const returnValue = await originalMethod.apply(this, args);
      await transaction.commit();
      return returnValue;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  };
}

export function Tx(target: Object, functionName: string, index: number) {
  const className = target.constructor.name;
  Reflect.defineMetadata(metaKey(className, functionName), index, target, functionName);
}

function metaKey(className: any, functionName: string): any {
  return `zb_${className}#${functionName}_txIndex`;
}
