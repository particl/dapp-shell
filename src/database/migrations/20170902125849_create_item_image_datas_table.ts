// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_image_datas', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('protocol'); // .notNullable();
            table.string('encoding'); // .notNullable();

            table.string('image_version'); // .notNullable();
            table.string('data_id'); // .notNullable();

            // moved to item_image_data_contents.data
            // table.text('data'); // .notNullable();

            table.integer('item_image_id').unsigned();
            table.foreign('item_image_id').references('id')
                .inTable('item_images').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());

            table.string('original_mime'); // .notNullable();
            table.string('original_name'); // .notNullable();
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('item_image_datas')
    ]);
};
