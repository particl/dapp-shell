// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { ListingItemObjectRepository } from '../repositories/ListingItemObjectRepository';
import { ListingItemObject } from '../models/ListingItemObject';
import { ListingItemObjectCreateRequest } from '../requests/ListingItemObjectCreateRequest';
import { ListingItemObjectDataCreateRequest } from '../requests/ListingItemObjectDataCreateRequest';
import { ListingItemObjectUpdateRequest } from '../requests/ListingItemObjectUpdateRequest';
import { ListingItemObjectSearchParams } from '../requests/ListingItemObjectSearchParams';

import { ListingItemObjectDataService } from './ListingItemObjectDataService';

export class ListingItemObjectService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectDataService) private listingItemObjectDataService: ListingItemObjectDataService,
        @inject(Types.Repository) @named(Targets.Repository.ListingItemObjectRepository) public listingItemObjectRepo: ListingItemObjectRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ListingItemObject> {
        const listingItemObject = await this.listingItemObjectRepo.findOne(id, withRelated);
        if (listingItemObject === null) {
            this.log.warn(`ListingItemObject with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return listingItemObject;
    }

    /**
     * searchBy ListingItemObject using given ListingItemObjectSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<ListingItemObject>>}
     */
    @validate()
    public async search(
        @request(ListingItemObjectSearchParams) options: ListingItemObjectSearchParams): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectRepo.search(options);
    }

    @validate()
    public async create( @request(ListingItemObjectCreateRequest) data: ListingItemObjectCreateRequest): Promise<ListingItemObject> {
        const startTime = new Date().getTime();

        const body = JSON.parse(JSON.stringify(data));
        // todo: could this be annotated in ListingItemObjectCreateRequest?
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // extract and remove related models from request
        const listingItemObjectDatas = body.listingItemObjectDatas || [];
        delete body.listingItemObjectDatas;

        // If the request body was valid we will create the listingItemObject
        const listingItemObject = await this.listingItemObjectRepo.create(body);

        for (const objectData of listingItemObjectDatas) {
            objectData.listing_item_object_id = listingItemObject.Id;
            await this.listingItemObjectDataService.create(objectData as ListingItemObjectDataCreateRequest);
        }

        // finally find and return the created listingItemObject
        const newListingItemObject = await this.findOne(listingItemObject.id);

        this.log.debug('listingItemObjectService.create: ' + (new Date().getTime() - startTime) + 'ms');
        return newListingItemObject;
    }

    @validate()
    public async update(id: number, @request(ListingItemObjectUpdateRequest) data: ListingItemObjectUpdateRequest): Promise<ListingItemObject> {

        const body = JSON.parse(JSON.stringify(data));

        // todo: messy
        if (body.listing_item_id == null && body.listing_item_template_id == null) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        // find the existing one without relatedb
        const listingItemObject = await this.findOne(id, false);

        // set new values
        listingItemObject.Type = body.type;
        listingItemObject.Description = body.description;
        listingItemObject.Order = body.order;

        // update listingItemObjectDatas
        const listingItemObjectJSON = listingItemObject.toJSON();
        const listingItemObjectDatasOld = listingItemObjectJSON.ListingItemObjectDatas || [];
        const objectDataIds: number[] = [];

        for (const objectData of listingItemObjectDatasOld) {
            objectDataIds.push(objectData.id);
        }

        for (const objectDataId of objectDataIds) {
            await this.listingItemObjectDataService.destroy(objectDataId);
        }

        const listingItemObjectDatas = body.listingItemObjectDatas || [];

        for (const objectData of listingItemObjectDatas) {
            objectData.listing_item_object_id = listingItemObject.Id;
            await this.listingItemObjectDataService.create(objectData as ListingItemObjectDataCreateRequest);
        }

        // update listingItemObject record
        const updatedListingItemObject = await this.listingItemObjectRepo.update(id, listingItemObject.toJSON());

        return updatedListingItemObject;
    }

    public async destroy(id: number): Promise<void> {
        await this.listingItemObjectRepo.destroy(id);
    }
}

