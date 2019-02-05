// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ProfileListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const profileCommand = Commands.PROFILE_ROOT.commandName;
    const profileListCommand = Commands.PROFILE_LIST.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    test('Should return no Profile', async () => {
        const res = await testUtil.rpc(profileCommand, [profileListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1); // getting default one
    });

    test('Should return one Profile', async () => {
        // generate single profile
        const generateRes = await testUtil.generateData(CreatableModel.PROFILE, 1);

        const res = await testUtil.rpc(profileCommand, [profileListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
    });

    test('Should return 4 Profiles', async () => {
        // generate three more profile
        const generateRes = await testUtil.generateData(CreatableModel.PROFILE, 3);

        const res = await testUtil.rpc(profileCommand, [profileListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(5);
    });
});
