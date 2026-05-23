// this file is used to seed entire database initially at once
import { fakerEN_IN as faker } from '@faker-js/faker';
import { db } from "@/lib/db";
// import { usersTable } from "@/lib/db/schema/index";


function createRandomUser() {
    const user = {
        name: faker.internet.displayName(),
        age: faker.number.int({ min: 18, max: 65 }),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        pincode: faker.location.zipCode(),
    };
    return user;
}

async function main() {
    const users = faker.helpers.multiple(createRandomUser, { count: 10});
    // const insertedUsers = await db.insert(usersTable).values(users).returning({ id: usersTable.id });
    // console.log(insertedUsers);

}

main();