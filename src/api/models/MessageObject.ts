// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { ActionMessage } from './ActionMessage';


export class MessageObject extends Bookshelf.Model<MessageObject> {

    public static RELATIONS = [];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<MessageObject> {
        if (withRelated) {
            return await MessageObject.where<MessageObject>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await MessageObject.where<MessageObject>({ id: value }).fetch();
        }
    }

    public get tableName(): string { return 'message_objects'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get DataId(): string { return this.get('data_id'); }
    public set DataId(value: string) { this.set('data_id', value); }

    public get DataValue(): string { return this.get('data_value'); }
    public set DataValue(value: string) { this.set('data_value', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public ActionMessage(): ActionMessage {
        return this.belongsTo(ActionMessage, 'action_message_id', 'id');
    }
}
