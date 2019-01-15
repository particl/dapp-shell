// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { Commands } from '../CommandEnumType';
import { CoreRpcService } from '../../services/CoreRpcService';

export class DaemonRootCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService
    ) {
        super(Commands.DAEMON_ROOT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: address id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        this.log.debug('data.params:', data.params);
        const command = data.params.shift();

        const response = await this.coreRpcService.call(command, data.params);
        this.log.debug('response: ', JSON.stringify(response));
        return response;
    }

    public usage(): string {
        return this.getName() + ' <command> [<arg> [<arg> [ ... ]]]  -  ' + this.description();
    }

    public help(): string {
        return this.usage() + '\n'
            + '    <command>    - string - The command to execute. \n'
            + '    <arg>        - string - An argument for the rpc command. ';
    }

    public description(): string {
        return 'Perform an rpc command on the Particl daemon.';
    }
}
