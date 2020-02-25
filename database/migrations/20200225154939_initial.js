exports.up = async function(knex) {
    await knex.schema.createTable("users", tbl => {
    tbl.increments();
    tbl
        .string("username", 255)
        .notNullable()
        .unique();
    tbl.string("password", 128).notNullable();
    });
};

exports.down = async function(knex) {
    await knex.schema.dropTableIfExists("users");
};