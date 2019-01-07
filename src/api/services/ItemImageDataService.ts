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
import { ItemImageDataRepository } from '../repositories/ItemImageDataRepository';
import { ItemImageData } from '../models/ItemImageData';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../requests/ItemImageDataUpdateRequest';
import { ItemImageDataContentCreateRequest } from '../requests/ItemImageDataContentCreateRequest';
import { ItemImageDataContentService } from './ItemImageDataContentService';

export class ItemImageDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemImageDataRepository) public itemImageDataRepo: ItemImageDataRepository,
        @inject(Types.Service) @named(Targets.Service.ItemImageDataContentService) public itemImageDataContentService: ItemImageDataContentService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImageData>> {
        return this.itemImageDataRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImageData> {
        const itemImageData = await this.itemImageDataRepo.findOne(id, withRelated);
        if (itemImageData === null) {
            this.log.warn(`ItemImageData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImageData;
    }

    @validate()
    public async create( @request(ItemImageDataCreateRequest) body: ItemImageDataCreateRequest): Promise<ItemImageData> {
        const startTime = new Date().getTime();

        if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null ) {
            throw new ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
        }

        const imageContent = body.data;
        delete body.data;

        const itemImageData = await this.itemImageDataRepo.create(body);

        const itemImageDataContent = {
            item_image_data_id: itemImageData.id,
            data: imageContent
        } as ItemImageDataContentCreateRequest;
        await this.itemImageDataContentService.create(itemImageDataContent);

        // finally find and return the created itemImageData
        const newItemImageData = await this.findOne(itemImageData.Id);
        this.log.debug('itemImageDataService.create: ' + (new Date().getTime() - startTime) + 'ms');
        return newItemImageData;
    }

    @validate()
    public async update(id: number, @request(ItemImageDataUpdateRequest) body: ItemImageDataCreateRequest): Promise<ItemImageData> {

        // todo: data will not be required later
        if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null ) {
            throw new ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
        }

        if (body.encoding !== 'BASE64') {
            this.log.warn('Unsupported image encoding. Only supports BASE64.');
        }

        // find the existing one without related
        const itemImageData = await this.findOne(id, true);

        // todo: update
        if ( itemImageData.ItemImageDataContent ) {
            const oldContent = itemImageData.toJSON();
            await this.itemImageDataContentService.destroy(oldContent.ItemImageDataContent.id);
        }

        // set new values
        if ( body.dataId ) {
            itemImageData.DataId = body.dataId;
        }
        if ( body.protocol ) {
            itemImageData.Protocol = body.protocol;
        }
        if ( body.imageVersion ) {
            itemImageData.ImageVersion = body.imageVersion;
        }
        if ( body.encoding ) {
            itemImageData.Encoding = body.encoding;
        }
        if ( body.data ) {
            const itemImageDataContent = {
                item_image_data_id: itemImageData.id,
                data: body.data
            } as ItemImageDataContentCreateRequest;
            await this.itemImageDataContentService.create(itemImageDataContent);
        }
        if ( body.originalMime ) {
            itemImageData.OriginalMime = body.originalMime;
        }
        if ( body.originalName ) {
            itemImageData.OriginalName = body.originalName;
        }

        // update itemImageData record
        const updatedItemImageData = await this.itemImageDataRepo.update(id, itemImageData.toJSON());
        return updatedItemImageData;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemImageDataRepo.destroy(id);
    }

}
