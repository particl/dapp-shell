// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ProfileUpdateCommand extends BaseCommand implements RpcCommandInterface<Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile id to be updated
     *  [1]: new profile name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Profile> {
        if (data.params.length < 2) {
            throw new MessageException('Missing args.');
        }

        return this.profileService.update(data.params[0], {
            name: data.params[1]
        });
    }

    public usage(): string {
        return this.getName() + ' <profileId> <newProfileName> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - Numeric - The ID of the profile we want to modify. \n'
            + '    <newProfileName>         - String - The new name we want to apply to the profile. ';
    }

    public description(): string {
        return 'Update the details of a profile given by profileId.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' 2 myNewProfile ';
    }
}
