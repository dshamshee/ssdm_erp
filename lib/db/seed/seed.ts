// this file is used to seed entire database initially at once
import { fakerEN_IN as faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth-schema";

function createRandomUser() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.helpers.arrayElement(["superAdmin", "admin", "student"]) as
      | "superAdmin"
      | "admin"
      | "student",
  };
}

async function main() {
  const users = faker.helpers.multiple(createRandomUser, { count: 5 });
  const insertedUsers = await db
    .insert(user)
    .values(users)
    .returning({ id: user.id });
  console.log(`Successfully seeded ${insertedUsers.length} users.`);
}

main();
