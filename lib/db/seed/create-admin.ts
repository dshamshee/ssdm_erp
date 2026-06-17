import { auth } from "@/lib/auth";

async function createSuperAdmin() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD is not set in .env");
    process.exit(1);
  }

  try {
    const response = await auth.api.signUpEmail({
      body: {
        name: "Super Admin",
        email: email,
        password: password,
        role: "superAdmin",
      },
    });

    if (response) {
      console.log(`✅ SuperAdmin account created successfully for: ${email}`);
    } else {
      console.log("⚠️ Could not create SuperAdmin (perhaps it already exists?).");
    }
  } catch (error: any) {
    if (error?.message?.includes("already exists") || error?.body?.message?.includes("already exists")) {
      console.log(`⚠️ SuperAdmin account with email ${email} already exists.`);
    } else {
      console.error("❌ Error creating SuperAdmin:", error);
    }
  }
}

createSuperAdmin();
