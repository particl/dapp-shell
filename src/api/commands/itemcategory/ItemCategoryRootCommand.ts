import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';

import { ItemCategoryListCommand } from './ItemCategoryListCommand';
import { ItemCategoryAddCommand } from './ItemCategoryAddCommand';
import { ItemCategoryFindCommand } from './ItemCategoryFindCommand';
import { ItemCategoryGetCommand } from './ItemCategoryGetCommand';
import { ItemCategoryRemoveCommand } from './ItemCategoryRemoveCommand';
import { ItemCategoryUpdateCommand } from './ItemCategoryUpdateCommand';

import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';

export class ItemCategoryRootCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryListCommand) private itemCategoryListCommand: ItemCategoryListCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryAddCommand) private itemCategoryAddCommand: ItemCategoryAddCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryFindCommand) private itemCategoryFindCommand: ItemCategoryFindCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryGetCommand) private itemCategoryGetCommand: ItemCategoryGetCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryRemoveCommand) private itemCategoryRemoveCommand: ItemCategoryRemoveCommand,
        @inject(Types.Command) @named(Targets.Command.itemcategory.ItemCategoryUpdateCommand) private itemCategoryUpdateCommand: ItemCategoryUpdateCommand,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.CATEGORY_ROOT);
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        return await this.executeNext(data, rpcCommandFactory);
    }

    public help(): string {
        return this.getName() + ' (list|get|add|update|remove|search)';
    }

    public description(): string {
        return 'Commands for managing itemcategory.';
    }
}
