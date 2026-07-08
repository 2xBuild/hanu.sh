export type Project = {
  name: string;
  href: string;
  logo: string;
  visibility: "active" | "inactive";
};

export const projects: Project[] = [
  {
    name: "onepurplepen",
    href: "https://onepurplepen.com",
    logo: "https://www.onepurplepen.com/logo.png",
    visibility: "active",
  },
  {
    name: "dotschool",
    href: "https://dotschool.org",
    logo: "https://www.dotschool.org/favicon.ico?favicon.10c00c_9fl9.p.ico",
    visibility: "inactive",
  },
  {
    name: "oneDB",
    href: "https://onedb.net",
    logo: "https://onedb.net/icon.svg",
    visibility: "active",
  },
  {
    name: "cutefol.io",
    href: "https://cutefol.io",
    logo: "https://cutefol.io/logo.png",
    visibility: "inactive",
  },

  {
    name: "tpot.cc",
    href: "https://tpot.cc",
    logo: "https://tpot.cc/favicon.ico?favicon.ed80e84c.ico",
    visibility: "inactive",
  },
  {
    name: "nearmate",
    href: "https://nearmate.io",
    logo: "https://nearmate.io/nearmate.png",
    visibility: "inactive",
  }
];
