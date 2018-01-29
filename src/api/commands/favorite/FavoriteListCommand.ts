import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { FavoriteItem } from '../../models/FavoriteItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ProfileService } from '../../services/ProfileService';

/*
 * Get a list of all favorites for profile
 */
export class FavoriteListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<FavoriteItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.FAVORITE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: profileId
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<FavoriteItem>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<FavoriteItem>> {
        // find the profile by id
        const profile = await this.profileService.findOne(data.params[0]);

        // return the related FavoriteItem for the profile
        return profile.related('FavoriteItems') as Bookshelf.Collection<FavoriteItem>;
    }

    public help(): string {
        return this.getName() + ' <profileId>\n'
            + '    <profileId>                     - Numeric - The ID of the profile we\n'
            + '                                       want to associate this favorite with.';
    }
}
