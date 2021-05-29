# ZB-Sequelize

## Quick Start

Simplify the management of sequelize transactions.

Example:

    import { Transactional, Tx } from 'zb-sequelize';

    @Transactional
    function(@Tx transaction) {
      // no need to create, commit or rollback a transaction.
    }

:point_right:	You only need to:

  - add `@Transactional` above the function.
  - if there is a transaction parameter, add a `@Tx` to it.

:bomb: You can remove::boom: 	

 - the initialization of the transaction.
 - the commit of the transaction.
 - the rollback of the transaction.

:rocket: Finally, you need to add this to the start of your application.

    initSequelizeResolver((args) => sequelize);

## Why ?

It's a matter of transaction management. Where and when should transactions be created and committed. Of course the function that creates the transaction should also commit it. **However, does the caller create the transaction, or should the function create the transaction?** 

 - :point_left:	Sometimes you need the caller to create the transaction. This is the case when multiple operations need to be executed using the same transaction in order to support a transactional rollback.
 - :point_right: Sometimes you just want the function to create it. That is true, when it's always executed as a single operation.
 - :middle_finger: Sometimes you want to support both. You could split it up in 2 functions, or you could add a lot of boilerplate code to your function to support both.

It does not have to be so complex actually. Decorators can actually do all this work for you. You keep the `transaction` property and pass it around as you always would. It will be instantiated automatically when necessary. You don't have to check for `if (transaction == null)`, you can assume that it will always be created for you.

You never have to perform a `sequelize.transaction()`, `transaction.commit()` or `try{}catch(){transaction.rollback()}` ever again. 

**It reduces about 7 to 10 lines of code for each starting point of a transaction.** Assuming that you have a controller that executes 3 operations in a transaction, and that each of these 3 can also be called directly by other controllers: you can reduce it by about 35 lines of code.

Similar java and C# frameworks have been using this solution for decades, and have confirmed that this is a good solution.

## How does it work

During execution, if there is a transaction specified, then really nothing special happens. But if the `transaction == null` then it will manage it for you:

 - The transaction will be created automatically. (just like `sequelize.transaction()`)
 - It will `commit()` at the end of the function.
 - It will `rollback()` if there is an error.

Also, if there is no `@Tx` annotation used, then it will also manage one for you.

## Configuration

### Basic

zb-sequelize needs access to your `sequelize` object. It uses this object to create new transactions.
Fortunately it is just 2 lines of code.

    import { Sequelize } from 'sequelize';
    import { initSequelizeResolver } from 'zb-sequelize';

    // you already have this:
    const sequelize = new Sequelize(options);

    // you need to add this:
    initSequelizeResolver((args) => sequelize);

### Advanced

Alternatively, you could also pass around the `sequelize` in the function parameters.
e.g. Your functions would for instance look like:  `function (dataStore, transaction) {}` where a `dataStore` argument contains the `sequelize` argument contains a reference to the `Sequelize` instance.

In that case, you would have to change the resolver to something like this:

    import { Sequelize } from 'sequelize';
    import { initSequelizeResolver, Transactional, Tx } from 'zb-sequelize';

    // the magic is here
    initSequelizeResolver((args) => args.find((arg) => arg && arg.sequelize));

    @Transactional
    function (dataStore: { sequelize: Sequelize }, @Tx transaction) { 
    }
