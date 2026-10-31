import fs from "fs";
import path from "path";
import { createHash } from "node:crypto";
import { createAdminClient } from "../lib/supabase/admin";

type Role = "admin" | "super_admin" | "support";

type Options = {
  email: string;
  password: string;
  name: string;
  role: Role;
};

const publishedDefaultPasswordHashes = new Set([
  "13e9c77fc659019641209eb64ffe689e74080c5ea617dd2099894aa4e6f3b4d9",
  "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
]);

function parseArgs(argv: string[]): Partial<Options> {
  const options: Partial<Options> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--email") {
      options.email = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--password") {
      options.password = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--name") {
      options.name = argv[index + 1];
      index += 1;
      continue;
    }

    if (token === "--role") {
      const role = argv[index + 1];
      if (role === "admin" || role === "super_admin" || role === "support") {
        options.role = role;
      }
      index += 1;
      continue;
    }
  }

  return options;
}

async function findAuthUserByEmail(email: string) {
  const supabase = createAdminClient();
  const normalizedEmail = email.toLowerCase();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const user =
      data.users.find((candidate) => candidate.email?.toLowerCase() === normalizedEmail) ?? null;

    if (user) {
      return user;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

function loadLocalEnv() {
  const envFiles = [".env", ".env.local"];

  for (const fileName of envFiles) {
    const filePath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const normalized = line.startsWith("export ") ? line.slice(7) : line;
      const separatorIndex = normalized.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = normalized.slice(0, separatorIndex).trim();
      let value = normalized.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] = value;
    }
  }
}

async function main() {
  loadLocalEnv();

  const args = parseArgs(process.argv.slice(2));
  const password = args.password || process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Provide a unique password using SEED_ADMIN_PASSWORD or --password.");
  }
  if (password.length < 12 || publishedDefaultPasswordHashes.has(createHash("sha256").update(password).digest("hex"))) {
    throw new Error("Use a unique password of at least 12 characters; published example passwords are not allowed.");
  }
  const options: Options = {
    email: args.email || "admin@autolist.local",
    password,
    name: args.name || "Local Admin",
    role: args.role || "admin",
  };

  const supabase = createAdminClient();
  const existingUser = await findAuthUserByEmail(options.email);

  let userId = existingUser?.id ?? null;
  let authAction: "created" | "updated" = "updated";

  if (!existingUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: options.email,
      password: options.password,
      email_confirm: true,
      user_metadata: {
        full_name: options.name,
      },
    });

    if (error || !data.user) {
      throw error || new Error("Failed to create auth user.");
    }

    userId = data.user.id;
    authAction = "created";
  } else {
    const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: options.password,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata || {}),
        full_name: options.name,
      },
    });

    if (error) {
      throw error;
    }
  }

  if (!userId) {
    throw new Error("Auth user id is missing after ensure-admin.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: options.email,
      full_name: options.name,
      role: options.role,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw profileError;
  }

  console.log(
    JSON.stringify(
      {
        email: options.email,
        name: options.name,
        role: options.role,
        authAction,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
