// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MarketRepository } from '../repositories/MarketRepository';
import { Market } from '../models/Market';
import { MarketCreateRequest } from '../requests/MarketCreateRequest';
import { MarketUpdateRequest } from '../requests/MarketUpdateRequest';


export class MarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MarketRepository) public marketRepo: MarketRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getDefault(withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.getDefault(withRelated);
        if (market === null) {
            this.log.warn(`Default Market was not found!`);
            throw new NotFoundException(process.env.DEFAULT_MARKETPLACE_NAME);
        }
        return market;
    }

    public async findAll(): Promise<Bookshelf.Collection<Market>> {
        return this.marketRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOne(id, withRelated);
        if (market === null) {
            this.log.warn(`Market with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return market;
    }

    public async findByAddress(address: string, withRelated: boolean = true): Promise<Market> {
        return await this.marketRepo.findOneByAddress(address, withRelated);
    }

    @validate()
    public async create( @request(MarketCreateRequest) body: MarketCreateRequest): Promise<Market> {

        // If the request body was valid we will create the market
        const market = await this.marketRepo.create(body);

        // finally find and return the created market
        const newMarket = await this.findOne(market.Id);
        return newMarket;
    }

    @validate()
    public async update(id: number, @request(MarketUpdateRequest) body: MarketUpdateRequest): Promise<Market> {

        // find the existing one without related
        const market = await this.findOne(id, false);

        // set new values
        market.Name = body.name;
        market.PrivateKey = body.private_key;
        market.Address = body.address;
        // update market record
        const updatedMarket = await this.marketRepo.update(id, market.toJSON());

        // return newMarket;
        return updatedMarket;
    }

    public async destroy(id: number): Promise<void> {
        await this.marketRepo.destroy(id);
    }

}
