// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressUpdateRequest } from '../../requests/AddressUpdateRequest';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { ShippingZips } from '../../../core/helpers/ShippingZips';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import * as resources from 'resources';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ZipCodeNotFoundException } from '../../exceptions/ZipCodeNotFoundException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { AddressType } from '../../enums/AddressType';

export class AddressUpdateCommand extends BaseCommand implements RpcCommandInterface<Address> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService
    ) {
        super(Commands.ADDRESS_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: addressId
     *  [1]: title
     *  [2]: firstName
     *  [3]: lastName
     *  [4]: addressLine1
     *  [5]: addressLine2
     *  [6]: city
     *  [7]: state
     *  [8]: country/countryCode
     *  [9]: zipCode
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Address> {

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        let countryCode: string = data.params[8];
        countryCode = ShippingCountries.convertAndValidate(countryCode);

        // Validate ZIP code
        const zipCodeStr = data.params[9];
        if (!ShippingZips.validate(countryCode, zipCodeStr)) {
            throw new ZipCodeNotFoundException(zipCodeStr);
        }

        return this.addressService.update(data.params[0], {
            title: data.params[1],
            firstName: data.params[2],
            lastName: data.params[3],
            addressLine1: data.params[4],
            addressLine2: data.params[5],
            city: data.params[6],
            state: data.params[7],
            country: countryCode,
            zipCode: zipCodeStr
        } as AddressUpdateRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('addressId');
        }
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('addressId');
        }
        if (data.params.length < 2) {
            throw new MissingParamException('title');
        }
        if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('title');
        }
        if (data.params.length < 3) {
            throw new MissingParamException('firstName');
        }
        if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('firstName');
        }
        if (data.params.length < 4) {
            throw new MissingParamException('lastName');
        }
        if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('lastName');
        }
        if (data.params.length < 5) {
            throw new MissingParamException('addressLine1');
        }
        if (typeof data.params[4] !== 'string') {
            throw new InvalidParamException('addressLine1');
        }
        if (data.params.length < 6) {
            throw new MissingParamException('addressLine2');
        }
        if (typeof data.params[5] !== 'string') {
            throw new InvalidParamException('addressLine2');
        }
        if (data.params.length < 7) {
            throw new MissingParamException('city');
        }
        if (typeof data.params[6] !== 'string') {
            throw new InvalidParamException('city');
        }
        if (data.params.length < 8) {
            throw new MissingParamException('state');
        }
        if (typeof data.params[7] !== 'string' && data.params[7] !== '') {
            throw new InvalidParamException('state');
        }
        if (data.params.length < 9) {
            throw new MissingParamException('country');
        }
        if (typeof data.params[8] !== 'string') {
            throw new InvalidParamException('country');
        }
        if (data.params.length < 10) {
            throw new MissingParamException('zipCode');
        }
        if (data.params[10]) {
            const type = data.params[10];
            const validTypes = [AddressType.SHIPPING_BID, AddressType.SHIPPING_ORDER, AddressType.SHIPPING_OWN];
            if (type && !_.includes(validTypes, type)) {
                throw new InvalidParamException('zipCode');
            }
        }
        return data;
    }


    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' <addressId> <title> <firstName> <lastName> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) <zip> ';
    }
    // tslint:enable:max-line-length

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <addressId>              - Numeric - The ID of the address we want to modify. \n'
            + '    <title>                  - String - A short identifier for the address. \n'
            + '    <firstName>              - String - First Name of user. \n'
            + '    <lastName>               - String - Last Name of user. \n'
            + '    <addressLine1>           - String - The first line of the address. \n'
            + '    <addressLine2>           - String - The second line of the address. \n'
            + '    <city>                   - String - The city of the address. \n'
            + '    <state>                  - String - The state of the address. \n'
            + '    <country>                - String - The country name of the address. \n'
            + '    <countryCode>            - String - Two letter country code of the address. \n'
            + '    <zip>                    - String - The ZIP code of your address. ';
    }

    public description(): string {
        return 'Update the details of an address given by ID.';
    }

    public example(): string {
        return 'address 1 ' + this.getName() + 'Home johnny deep \'1060 West Addison Street\' \'\' Chicago IL \'United States\' 60613 ';
    }
}
