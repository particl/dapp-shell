// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { TestDataGenerateRequest } from '../../requests/TestDataGenerateRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {MessageException} from '../../exceptions/MessageException';

export class DataGenerateCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService
    ) {
        super(Commands.DATA_GENERATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: CreatableModel, model to generate
     *  [1]: amount
     *  [2]: withRelated, return full objects or just id's
     *  [3...]: generateParams
     *
     * @param {RpcRequest} data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);
        const generateParams = data.params.length > 3 ? _.slice(data.params, 3) : [];

        return await this.testDataService.generate({
            model: data.params[0],
            amount: data.params[1],
            withRelated: data.params[2],
            generateParams
        } as TestDataGenerateRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MessageException('Missing model.');
        }
        if (data.params.length < 2) {
            throw new MessageException('Missing json.');
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' <model> [<amount> [<withRelated>]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <model>                  - ENUM{listingitemtemplate|listingitem|profile|itemcategory \n'
            + '                                |favoriteitem|iteminformation|bid|paymentinformation|itemimage} \n'
            + '                                - The type of data we want to generate. \n'
            + '    <amount>                 - [optional] Numeric - The number of objects we want to generate. \n'
            + '    <withRelated>            - [optional] Boolean - Whether to return full objects or just id. ';
    }

    public description(): string {
        return 'Autogenerates data for the database.';
    }

    public example(): string {
        return 'data ' + this.getName() + ' profile 1 true';
    }
}
