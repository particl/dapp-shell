// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItemSearchParams } from '../../../src/api/requests/ListingItemSearchParams';
import * as _ from 'lodash';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';

describe('ListingItemSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const itemSearchCommand = Commands.ITEM_SEARCH.commandName;
    const itemFlagCommand = Commands.ITEM_FLAG.commandName;
    const itemGetCommand = Commands.ITEM_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdListingItem: resources.ListingItem;

    const defaultListingItemSearchParams = new ListingItemSearchParams();

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        // generate ListingItemTemplate with ListingItem
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        createdListingItemTemplate = listingItemTemplates[0];
        // log.debug('listingItemTemplate:', JSON.stringify(createdListingItemTemplate, null, 2));

        // expect template is related to correct profile and listingitem posted to correct market
        expect(createdListingItemTemplate.Profile.id).toBe(defaultProfile.id);
        expect(createdListingItemTemplate.ListingItems[0].marketId).toBe(defaultMarket.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHash.getHash(createdListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);
        log.debug('listingItemTemplate.hash:', createdListingItemTemplate.hash);
        log.debug('generatedTemplateHash:', generatedTemplateHash);
        expect(createdListingItemTemplate.hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        log.debug('listingItemTemplate.hash:', createdListingItemTemplate.hash);
        log.debug('listingItemTemplate.ListingItems[0].hash:', createdListingItemTemplate.ListingItems[0].hash);
        expect(createdListingItemTemplate.hash).toBe(createdListingItemTemplate.ListingItems[0].hash);

        // generate ListingItem without a ListingItemTemplate
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];

        createdListingItem = listingItems[0];
    });

    test('Should fail to search ListingItems if type is invalid', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.type = 'INVALID';
        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(404);

        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Type should be FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL');
    });

    test('Should fail to search ListingItems if profileId is not (NUMBER | OWN | ALL)', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = 'INVALID';

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Value needs to be number | OWN | ALL. you could pass * as all too');
    });

    test('Should search OWN ListingItems when profileid = OWN', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = 'OWN';

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdListingItemTemplate.ListingItems[0].hash);
    });

    test('Should search ALL ListingItems when profileid = ALL', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = 'ALL';

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItemTemplate.ListingItems[0].hash);
        expect(result[1].hash).toBe(createdListingItem.hash);
    });

    test('Should search ALL ListingItems when profileId is empty, since default is ALL', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItemTemplate.ListingItems[0].hash);
        expect(result[1].hash).toBe(createdListingItem.hash);
    });

    test('Should search ALL ListingItems when profileId = *', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItemTemplate.ListingItems[0].hash);
        expect(result[1].hash).toBe(createdListingItem.hash);
    });

    test('Should search only first ListingItem using pagination and setting pageLimit to 1', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';
        params.pageLimit = 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdListingItemTemplate.ListingItems[0].hash);

    });

    test('Should search the second ListingItem using pagination and setting page to 1 with pageLimit set to 1', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';
        params.pageLimit = 1;
        params.page = 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdListingItem.hash);
    });

    test('Should return empty ListingItems array if invalid pagination', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';
        params.pageLimit = 1;
        params.page = 2;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should search ListingItems by category.key', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';
        params.category = createdListingItem.ItemInformation.ItemCategory.key;

        // TODO: add category to item generation
        const itemCount = createdListingItem.ItemInformation.ItemCategory.key
            === createdListingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.key
            ? 2 : 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ItemCategory.key).toBe(params.category);
    });

    test('Should search ListingItems by category.id', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';
        params.category = createdListingItem.ItemInformation.ItemCategory.id;

        const itemCount = createdListingItem.ItemInformation.ItemCategory.id
            === createdListingItemTemplate.ListingItems[0].ItemInformation.ItemCategory.id
            ? 2 : 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // log.debug('params:', JSON.stringify(params, null, 2));
        // log.debug('result[0].ItemInformation.ItemCategory.id:', result[0].ItemInformation.ItemCategory.id);
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ItemCategory.id).toBe(params.category);

    });

    test('Should search ListingItems by searchString', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.searchString = createdListingItem.ItemInformation.title.substr(0, 10);

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].hash).toBe(createdListingItem.hash);

    });

    test('Should return two ListingItems when searching by price', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.minPrice = createdListingItem.PaymentInformation.ItemPrice.basePrice
            < createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? createdListingItem.PaymentInformation.ItemPrice.basePrice - 0.0001
            : createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice - 0.0001;

        params.maxPrice = createdListingItem.PaymentInformation.ItemPrice.basePrice
            > createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? createdListingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
    });

    test('Should return one ListingItem when searching by price', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.minPrice = createdListingItem.PaymentInformation.ItemPrice.basePrice
            < createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? createdListingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        params.maxPrice = createdListingItem.PaymentInformation.ItemPrice.basePrice
        > createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? createdListingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(1);
    });

    test('Should return no ListingItems when searching using invalid price range', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.minPrice = 1000.0001;
        params.maxPrice = 1000.0002;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should return ListingItems without related', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';
        params.withRelated = false;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].hash).toBe(createdListingItemTemplate.ListingItems[0].hash);
        expect(result[0].ItemInformation).toBeUndefined();
        expect(result[0].PaymentInformation).toBeUndefined();
        expect(result[0].MessagingInformation).toBeUndefined();
        expect(result[0].ListingItemObjects).toBeUndefined();
        expect(result[0].Bids).toBeUndefined();
        expect(result[0].Market).toBeUndefined();
    });


    test('Should search ListingItems by country (ItemLocation)', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';
        params.country = createdListingItem.ItemInformation.ItemLocation.region;

        const itemCount = createdListingItem.ItemInformation.ItemLocation.region
        === createdListingItemTemplate.ListingItems[0].ItemInformation.ItemLocation.region
            ? 2 : 1;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ItemLocation.region).toBe(params.country);

    });

    test('Should search ListingItem by ShippingDestination', async () => {
        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.profileId = '*';

        const shippingDestinationsForItem1: resources.ShippingDestination[] = createdListingItem.ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShip = _.filter(shippingDestinationsForItem1, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS;
        });

        params.shippingDestination = shippingDestinationsThatShip[0].country;

        const shippingDestinationsForItem2: resources.ShippingDestination[] = createdListingItemTemplate.ListingItems[0].ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShipToTheSamePlace = _.filter(shippingDestinationsForItem2, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS
                && o.country === params.shippingDestination;
        });

        const itemCount = 1 + shippingDestinationsThatShipToTheSamePlace.length;

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);
        expect(result[0].ItemInformation.ShippingDestinations[0].country).toBe(params.shippingDestination);
    });

    test('Should search ListingItem by ShippingDestination, min-maxPrice and searchString', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());

        const shippingDestinationsForItem1: resources.ShippingDestination[] = createdListingItem.ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShip = _.filter(shippingDestinationsForItem1, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS;
        });

        params.shippingDestination = shippingDestinationsThatShip[0].country;

        const shippingDestinationsForItem2: resources.ShippingDestination[] = createdListingItemTemplate.ListingItems[0].ItemInformation.ShippingDestinations;
        const shippingDestinationsThatShipToTheSamePlace = _.filter(shippingDestinationsForItem2, (o: resources.ShippingDestination) => {
            return o.shippingAvailability === ShippingAvailability.SHIPS
                && o.country === params.shippingDestination;
        });

        const itemCount = 1 + shippingDestinationsThatShipToTheSamePlace.length;

        params.minPrice = createdListingItem.PaymentInformation.ItemPrice.basePrice
        < createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? createdListingItem.PaymentInformation.ItemPrice.basePrice - 0.0001
            : createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice - 0.0001;

        params.maxPrice = createdListingItem.PaymentInformation.ItemPrice.basePrice
        > createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice
            ? createdListingItem.PaymentInformation.ItemPrice.basePrice + 0.0001
            : createdListingItemTemplate.ListingItems[0].PaymentInformation.ItemPrice.basePrice + 0.0001;

        params.searchString = createdListingItem.ItemInformation.title.substr(0, 10);

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(itemCount);

    });

    test('Should find all ListingItems when using no search criteria', async () => {

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());

        const res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.length).toBe(2);
    });

    test('Should search for flagged listing items', async () => {
        // flag item
        let res = await testUtil.rpc(itemCommand, [itemFlagCommand,
            createdListingItem.hash,
            defaultProfile.id
        ]);
        // make sure we got the expected result from posting the proposal
        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');

        const params = new ListingItemSearchParams(defaultListingItemSearchParams.toParamsArray());
        params.flagged = true;
        res = await testUtil.rpc(itemCommand, [itemSearchCommand].concat(params.toParamsArray()));
        res.expectJson();
        res.expectStatusCode(200);
        const resMain: any = res.getBody()['result'];

        expect(resMain.length).toBe(1);
        expect(resMain[0].hash).toBe(createdListingItem.hash);
    });

});
