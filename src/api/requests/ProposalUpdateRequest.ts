import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ProposalUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public submitter: string;

    @IsNotEmpty()
    public blockStart: number;

    @IsNotEmpty()
    public blockEnd: number;

    @IsNotEmpty()
    public createdAt: Date;

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public description: string;

}
// tslint:enable:variable-name