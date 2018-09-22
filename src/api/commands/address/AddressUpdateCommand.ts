// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotFoundException } from '../../exceptions/NotFoundException';

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
        countryCode = ShippingCountries.validate(this.log, countryCode);

        // Validate ZIP code
        const zipCodeStr = data.params[9];
        if (!ShippingZips.validate(countryCode, zipCodeStr)) {
            throw new NotFoundException('ZIP/postal-code, country code, combination not valid.');
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

    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' <addressId> <title> <firstName> <lastName> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) [<zip>] ';
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
