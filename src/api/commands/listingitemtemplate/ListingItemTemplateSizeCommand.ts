// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageSize } from '../../responses/MessageSize';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EscrowType } from 'omp-lib/dist/interfaces/omp-enums';
import { CryptoAddressType } from 'omp-lib/dist/interfaces/crypto';
import { ListingItemAddActionService } from '../../services/action/ListingItemAddActionService';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MarketService } from '../../services/model/MarketService';
import { MessageException } from '../../exceptions/MessageException';

export class ListingItemTemplateSizeCommand extends BaseCommand implements RpcCommandInterface<MessageSize> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService
    ) {
        super(Commands.TEMPLATE_SIZE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<MessageSize> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const market: resources.Market = data.params[1];

        // template might not have a payment address (CryptocurrencyAddress) yet, so in that case we'll
        // add some data to get a more realistic result
        if (!listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress
            || _.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress)) {
            listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress = {} as resources.CryptocurrencyAddress;

            if (EscrowType.MAD_CT === listingItemTemplate.PaymentInformation.Escrow.type) {
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.address
                    = 'TetbeNoZDWJ6mMzMBy745BXQ84KntsNch58GWz53cqG6X5uupqNojqcoC7vmEguRPfC5QkpJsdbBnEcdXMLgJG2dAtoAinSdKNFWtB';
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.type = CryptoAddressType.STEALTH;
            } else {
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.address = 'pmnK6L2iZx9zLA6GAmd3BUWq6yKa53Lb8H';
                listingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress.type = CryptoAddressType.NORMAL;
            }
        }
        return await this.listingItemAddActionService.calculateMarketplaceMessageSize(listingItemTemplate, market);

    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        }

        // make sure required data exists and fetch it
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]).then(value => value.toJSON());

        // todo: pretty much the same validations as in template post
        // ListingItemTemplate should be a market template
        if (_.isEmpty(listingItemTemplate.market)) {
            throw new MessageException('ListingItemTemplate has no market.');
        }

        if (_.isEmpty(listingItemTemplate.PaymentInformation)) {
            throw new ModelNotFoundException('PaymentInformation');
        } else if (_.isEmpty(listingItemTemplate.PaymentInformation.ItemPrice)) {
            throw new ModelNotFoundException('ItemPrice');
        } else if (_.isEmpty(listingItemTemplate.ItemInformation.ItemCategory)) {
            // we cannot post without a category
            throw new ModelNotFoundException('ItemCategory');
        }

        // make sure the Market exists for the Profile
        const profileId = listingItemTemplate.Profile.id;
        const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(profileId, listingItemTemplate.market)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Market');
            });

        this.log.debug('market:', JSON.stringify(market, null, 2));

        data.params[0] = listingItemTemplate;
        data.params[1] = market;
        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The Id of the ListingItemTemplate. ';
    }

    public description(): string {
        return 'Calculate and return ListingItemTemplate size and whether it fits in a single SmsgMessage or not.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
