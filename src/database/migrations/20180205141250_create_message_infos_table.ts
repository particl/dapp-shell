// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('message_infos', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('action_message_id').notNullable();
            table.foreign('action_message_id').references('id')
                .inTable('action_messages').onDelete('cascade');

            table.string('address').nullable();
            table.string('memo').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('message_infos')
    ]);
};
