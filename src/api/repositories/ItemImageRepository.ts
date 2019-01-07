// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ItemImage } from '../models/ItemImage';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ItemImageRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ItemImage) public ItemImageModel: typeof ItemImage,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImage>> {
        const list = await this.ItemImageModel.fetchAll();
        return list as Bookshelf.Collection<ItemImage>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImage> {
        return await this.ItemImageModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ItemImage> {
        const startTime = new Date().getTime();
        const itemImage = this.ItemImageModel.forge<ItemImage>(data);
        try {
            const itemImageCreated = await itemImage.save();
            const result = await this.ItemImageModel.fetchById(itemImageCreated.id);
            this.log.debug('itemImageRepository.create: ' + (new Date().getTime() - startTime) + 'ms');
            return result;
        } catch (error) {
            throw new DatabaseException('Could not create the itemImage!', error);
        }
    }

    public async update(id: number, data: any): Promise<ItemImage> {
        const itemImage = this.ItemImageModel.forge<ItemImage>({ id });
        try {
            const itemImageUpdated = await itemImage.save(data, { patch: true });
            return await this.ItemImageModel.fetchById(itemImageUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the itemImage!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let itemImage = this.ItemImageModel.forge<ItemImage>({ id });
        try {
            itemImage = await itemImage.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await itemImage.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the itemImage!', error);
        }
    }

}
