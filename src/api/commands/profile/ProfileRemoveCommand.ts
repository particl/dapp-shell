// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ProfileService } from '../../services/ProfileService';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {MessageException} from '../../exceptions/MessageException';

export class ProfileRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id or name
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        if (data.params.length < 1) {
            throw new MessageException('Missing paramater id or name.');
        }

        let profileId = data.params[0];

        if (typeof data.params[0] === 'string') {
           const profile = await this.profileService.findOneByName(data.params[0]);
           profileId = profile ? profile.id : data.params[0];
        }
        return this.profileService.destroy(profileId);
    }

    public usage(): string {
        return this.getName() + ' (<profileId>|<profileName>) ';
    }

    public help(): string {
        return this.usage() + '- ' + this.description() + ' \n'
            + '    <profileID>              -  That profile ID of the profile we want to destroy. \n'
            + '    <profileName>            -  String - The name of the profile we \n'
            + '                                 want to destroy. ';
    }

    public description(): string {
        return 'Destroy a profile by profile id or profileName.';
    }

    public example(): string {
        return 'profile ' + this.getName() + ' 2 ';
    }
}
