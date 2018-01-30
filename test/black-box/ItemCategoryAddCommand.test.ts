import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('ItemCategoryAddCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.CATEGORY_ROOT.commandName;
    const subCommand = Commands.CATEGORY_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();
    });

    const parentCategory = {
        id: 0,
        key: 'cat_high_real_estate'
    };

    test('Should create the category by parent category key', async () => {
        //  test default category data
        const categoryData = {
            name: 'Sample Category 1',
            description: 'Sample Category Description 1'
        };
        const res = await rpc(method, [subCommand, categoryData.name, categoryData.description, parentCategory.key]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        parentCategory.id = result.parentItemCategoryId;
        expect(result.name).toBe(categoryData.name);
        expect(result.description).toBe(categoryData.description);
        expect(result.ParentItemCategory.key).toBe(parentCategory.key);
    });

    test('Should create the category by parent category Id', async () => {
        //  test default category data
        const categoryData = {
            name: 'Sample Category 2',
            description: 'Sample Category Description 2'
        };
        const res = await rpc(method, [subCommand, categoryData.name, categoryData.description, parentCategory.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(categoryData.name);
        expect(result.description).toBe(categoryData.description);
        expect(result.parentItemCategoryId).toBe(parentCategory.id);
        expect(result.ParentItemCategory.key).toBe(parentCategory.key);
    });

    test('Should create the category without passing category (by default root)', async () => {
        //  test default category data
        const categoryData = {
            name: 'Sample Category 3',
            description: 'Sample Category Description 3'
        };
        const res = await rpc(method, [subCommand, categoryData.name, categoryData.description]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(categoryData.name);
        expect(result.description).toBe(categoryData.description);
        expect(result.ParentItemCategory.key).toBe('cat_ROOT');
    });

});
