// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressCreateRequest } from '../../requests/AddressCreateRequest';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { ShippingZips } from '../../../core/helpers/ShippingZips';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { AddressType } from '../../enums/AddressType';

export class AddressAddCommand extends BaseCommand implements RpcCommandInterface<Address> {
    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService
    ) {
        super(Commands.ADDRESS_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: title
     *  [2]: firstName
     *  [3]: lastName
     *  [4]: addressLine1
     *  [5]: addressLine2
     *  [6]: city
     *  [7]: state
     *  [8]: country/countryCode
     *  [9]: zipCode
     *  [10]: type, optional, default: AddressType.SHIPPING_OWN
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Address> {

        // TODO: validate that there are correct amount of params

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        let countryCode: string = data.params[8];
        countryCode = ShippingCountries.validate(this.log, countryCode);
        this.log.debug('countryCode:', countryCode);

        // Validate ZIP code
        const zipCodeStr = data.params[9];
        if (!ShippingZips.validate(countryCode, zipCodeStr)) {
            throw new NotFoundException('ZIP/postal-code, country code, combination not valid.');
        }
        this.log.debug('zipCodeStr:', zipCodeStr);

        const newAddress = {
            profile_id: data.params[0],
            title: data.params[1],
            firstName: data.params[2],
            lastName: data.params[3],
            addressLine1: data.params[4],
            addressLine2: data.params[5],
            city: data.params[6],
            state: data.params[7],
            country: countryCode,
            zipCode: zipCodeStr,
            type: data.params[10] ? data.params[10] : AddressType.SHIPPING_OWN
        } as AddressCreateRequest;

        this.log.debug('newAddress:', newAddress);

        return await this.addressService.create(newAddress);
    }

    public async validate(data: RpcRequest): Promise<void> {
        //
    }

    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' <profileId> <firstName> <lastName> <title> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) <zip> ';
    }
    // tslint:enable:max-line-length

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the profile we want to associate \n'
            + '                                this address with. \n'
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
        return 'Create an address and associate it with a profile.';
    }

    public example(): string {
        return 'address ' + this.getName() + ' 1 myLocation \'Johnny\' \'Deep\' \'123 Fake St\' \'\' Springfield NT \'United States\' 90701';
    }
}
