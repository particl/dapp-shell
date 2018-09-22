// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('DataGenerateCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const dataCommand = Commands.DATA_ROOT.commandName;
    const dataGenerateCommand = Commands.DATA_GENERATE.commandName;

    const WITH_RELATED = true;

    beforeAll(async () => {
        await testUtil.cleanDb();

    });

    test('Should generate one Profile with no related data', async () => {

        const generateProfileParams = new GenerateProfileParams([
            false,  // generateShippingAddresses
            false   // generateCryptocurrencyAddresses
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.PROFILE, 1, WITH_RELATED].concat(generateProfileParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].name).not.toBeUndefined();
        expect(result[0].address).not.toBeUndefined();
        expect(result[0].ShippingAddresses).toHaveLength(0);
        expect(result[0].CryptocurrencyAddresses).toHaveLength(0);
    });

    test('Should generate one Profile with ShippingAddresses', async () => {

        const generateProfileParams = new GenerateProfileParams([
            true,  // generateShippingAddresses
            false   // generateCryptocurrencyAddresses
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.PROFILE, 1, WITH_RELATED].concat(generateProfileParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].name).not.toBeUndefined();
        expect(result[0].address).not.toBeUndefined();
        expect(result[0].ShippingAddresses).not.toBeUndefined();
        expect(result[0].CryptocurrencyAddresses).toHaveLength(0);
    });

    test('Should generate one Profile with CryptocurrencyAddresses', async () => {

        const generateProfileParams = new GenerateProfileParams([
            false,  // generateShippingAddresses
            true   // generateCryptocurrencyAddresses
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.PROFILE, 1, WITH_RELATED].concat(generateProfileParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].name).not.toBeUndefined();
        expect(result[0].address).not.toBeUndefined();
        expect(result[0].ShippingAddresses).toHaveLength(0);
        expect(result[0].CryptocurrencyAddresses).not.toBeUndefined();
    });

    test('Should generate two Profiles', async () => {
        const generateProfileParams = new GenerateProfileParams([
            true,  // generateShippingAddresses
            true   // generateCryptocurrencyAddresses
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.PROFILE, 2, WITH_RELATED].concat(generateProfileParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(2);
        expect(result[0].address).not.toBeUndefined();
        expect(result[0].ShippingAddresses).not.toBeUndefined();
        expect(result[0].CryptocurrencyAddresses).not.toBeUndefined();

    });

    test('Should generate one ListingItem with no related data', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation).toMatchObject({});
        expect(result[0].PaymentInformation).toMatchObject({});
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).toHaveLength(0);
        expect(result[0].PaymentInformation).toMatchObject({});
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations and ItemImages', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation).toMatchObject({});
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages and PaymentInformation', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation and Escrow', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation, Escrow and ItemPrice', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].PaymentInformation.ItemPrice.id).toBeDefined();
        expect(result[0].MessagingInformation).toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation, Escrow, ' +
        'ItemPrice and MessagingInformation', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].PaymentInformation.ItemPrice.id).toBeDefined();
        expect(result[0].MessagingInformation).not.toHaveLength(0);
        expect(result[0].ListingItemObjects).toHaveLength(0);

    });

    test('Should generate one ListingItem with ItemInformation, ShippingDestinations, ItemImages, PaymentInformation, Escrow, ' +
        'ItemPrice, MessagingInformation and ListingItemObjects', async () => {

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        const res = await testUtil.rpc(dataCommand, [dataGenerateCommand, CreatableModel.LISTINGITEM, 1, WITH_RELATED].concat(generateListingItemParams));
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result).toHaveLength(1);
        expect(result[0].ItemInformation.id).toBeDefined();
        expect(result[0].ItemInformation.ShippingDestinations).not.toHaveLength(0);
        expect(result[0].ItemInformation.ItemImages).not.toHaveLength(0);
        expect(result[0].PaymentInformation.id).toBeDefined();
        expect(result[0].PaymentInformation.Escrow.id).toBeDefined();
        expect(result[0].PaymentInformation.ItemPrice.id).toBeDefined();
        expect(result[0].MessagingInformation).not.toHaveLength(0);
        expect(result[0].ListingItemObjects).not.toHaveLength(0);

    });
});
