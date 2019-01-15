// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ItemCategorySearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categorySearchCommand = Commands.CATEGORY_SEARCH.commandName;

    const parentCategory = {
        id: 0,
        key: 'cat_high_real_estate'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create category
        const categoryData = {
            name: 'Sample Category 1',
            description: 'Sample Category Description 1',
            parent_item_category_id: 'cat_ROOT'
        };
        await testUtil.rpc(Commands.CATEGORY_ROOT.commandName, [
            Commands.CATEGORY_ADD.commandName,
            categoryData.name,
            categoryData.description,
            categoryData.parent_item_category_id
        ]);

    });

    test('Should find ItemCategories, when search string matches', async () => {

        //  find categories
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand, 'Sample']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).not.toBe(0);
        // TODO: expect the previously inserted one
    });

    test('Should fail to search iItemCategories because theres no search string', async () => {
        //  find categories
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('SearchString can not be null');
    });

    test('Should find get any ItemCategories when the search string doesnt match', async () => {
        //  find categories
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand, 'NOTFOUNDCATEGORY']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });
});
