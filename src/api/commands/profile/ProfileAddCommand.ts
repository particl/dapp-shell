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
     *  [1]: profile address
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Profile> {
        if (data.params.length < 1) {
            throw new MessageException('Requires profile name arg.');
        }
        const profile = await this.profileService.findOneByName(data.params[0]);
        // check if profile already exist for the given name
        if (profile !== null) {
            throw new MessageException(`Profile already exist for the given name = ${data.params[0]}`);
        }
        // create profile
        return this.profileService.create({
            name : data.params[0],
            address : (data.params[1] || null)
        } as ProfileCreateRequest);
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
