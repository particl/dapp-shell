// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ProfileCreateRequest } from '../../requests/ProfileCreateRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ProfileAddCommand extends BaseCommand implements RpcCommandInterface<Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile name
     *  [1]: profile address, optional
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Profile> {
        return await this.profileService.create({
            name : data.params[0],
            address : (data.params[1] || null)
        } as ProfileCreateRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MessageException('Missing name.');
        }

        // check if profile already exist for the given name
        const exists = await this.profileService.findOneByName(data.params[0])
            .then(async value => {
                return true;
            })
            .catch(async reason => {
                return false;
            });

        if (exists) {
            // if it does, throw
            throw new MessageException(`Profile already exist for the given name = ${data.params[0]}`);
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileName> [<profileAddress>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileName>            - The name of the profile we want to create. \n'
            + '    <profileAddress>         - [optional] the particl address of this profile. \n'
            + '                                This is the address that\'s used in the particl \n'
            + '                                messaging system. Will be automatically generated \n'
            + '                                if omitted. ';
    }

    public description(): string {
        return 'Create a new profile.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' myProfile PkE5U1Erz9bANXAxvHeiw6t14vDTP9EdNM ';
    }
}
