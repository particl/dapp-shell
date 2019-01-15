// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('listing_items', (table: Knex.CreateTableBuilder) => {

            table.increments('id').primary();
            table.string('hash').notNullable().unique();

            table.string('seller').notNullable();

            table.integer('market_id').unsigned().notNullable();
            table.foreign('market_id').references('id')
                .inTable('markets').onDelete('cascade');

            table.integer('listing_item_template_id').unsigned().nullable();
            table.foreign('listing_item_template_id').references('id')
                .inTable('listing_item_templates').onDelete('cascade');

            table.integer('expiry_time').unsigned();
            table.integer('received_at').notNullable();
            table.integer('posted_at').notNullable();
            table.integer('expired_at').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('listing_items')
    ]);
};
