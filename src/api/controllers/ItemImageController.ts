// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { controller, httpGet, httpPost, httpPut, httpDelete, response, requestBody, requestParam, request } from 'inversify-express-utils';
import { Types, Core, Targets } from '../../constants';
import { app } from '../../app';
import { ItemImageService } from '../services/ItemImageService';
import { ItemImageHttpUploadService } from '../services/ItemImageHttpUploadService';
import { Logger as LoggerType } from '../../core/Logger';
import { ImagePostUploadRequest } from '../requests/ImagePostUploadRequest';
import * as _ from 'lodash';
import * as resources from 'resources';

// Get middlewares
const restApi = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.AuthenticateMiddleware);
const multerMiddleware = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.MulterMiddleware);

@controller('/item-images', multerMiddleware.use, restApi.use)
export class ItemImageController {

    public log: LoggerType;

    constructor(@inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
                @inject(Types.Service) @named(Targets.Service.ItemImageHttpUploadService) private itemImageHttpUploadService: ItemImageHttpUploadService,
                @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @httpPost('/template/:templateId')
    public async create(@response() res: myExpress.Response, @requestParam('templateId') templateId: string,
                        @requestBody() body: any, @request() req: any): Promise<resources.ItemImage[]> {

        return this.itemImageHttpUploadService.httpPostImageUpload(new ImagePostUploadRequest({
            listingItemTemplateId: templateId,
            requestBody: body,
            request: req
        }));
    }

    @httpGet('/:id/:imageVersion')
    public async publishImage(@response() res: myExpress.Response, @requestParam('id') id: string, @requestParam('imageVersion')
        imageVersion: string): Promise<any> {

        // find the itemImage by id
        const itemImage = await this.itemImageService.findOne(parseInt(id, 10));

        const itemImageResult = itemImage.toJSON();

        // search the itemImageData like params image version
        const imgVersion: any = await _.find(itemImageResult.ItemImageDatas, data => data['imageVersion'] === imageVersion);

        if (itemImage === null || itemImageResult.ItemImageDatas.length === 0 || !imgVersion) {
            res.status(404).send('Image Not found');
        } else {
            const data = imgVersion.ItemImageDataContent.data || imgVersion.data;
            const dataBuffer = new Buffer(data, 'base64');
            res.setHeader('Content-Disposition', 'filename=' + imageVersion);
            res.send(dataBuffer);
        }
    }
}

