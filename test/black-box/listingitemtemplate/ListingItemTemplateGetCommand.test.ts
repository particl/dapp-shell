// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ListingItemTemplateGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
        true,   // generateItemInformation
        true,   // generateShippingDestinations
        false,   // generateItemImages
        true,   // generatePaymentInformation
        true,   // generateEscrow
        true,   // generateItemPrice
        true,   // generateMessagingInformation
        false    // generateListingItemObjects
    ]).toParamsArray();

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

    });

    test('Should return one ListingItemTemplate by Id', async () => {

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        const testData = listingItemTemplates[0];

        // fetch using id
        const res = await testUtil.rpc(templateCommand, [templateGetCommand, listingItemTemplates[0].id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.Profile.id).toBe(defaultProfile.id);
        expect(result.Profile.name).toBe(defaultProfile.name);
        expect(result).hasOwnProperty('Profile');
        expect(result).hasOwnProperty('ItemInformation');
        expect(result).hasOwnProperty('PaymentInformation');
        expect(result).hasOwnProperty('MessagingInformation');
        expect(result).hasOwnProperty('ListingItemObjects');
        expect(result).hasOwnProperty('ListingItem');

        expect(result.hash).toBe(testData.hash);

        expect(result.ItemInformation.title).toBe(testData.ItemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.ItemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.ItemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.key).toBe(testData.ItemInformation.ItemCategory.key);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.ItemInformation.ItemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.ItemInformation.ItemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.ItemInformation.ItemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.ItemInformation.ItemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.ItemInformation.ItemLocation.LocationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.ItemInformation.ItemLocation.LocationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toBeDefined();
        expect(result.ItemInformation.ItemImages).toBeDefined();

        expect(result.PaymentInformation.type).toBe(testData.PaymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.PaymentInformation.Escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.PaymentInformation.Escrow.Ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.PaymentInformation.Escrow.Ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.PaymentInformation.ItemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.PaymentInformation.ItemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.PaymentInformation.ItemPrice.ShippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testData.PaymentInformation.ItemPrice.CryptocurrencyAddress.address);

        expect(result.MessagingInformation.protocol).toBe(testData.MessagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testData.MessagingInformation.publicKey);
    });
});
