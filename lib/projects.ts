export type Project = {
  name: string;
  href: string;
  logo: string;
  logoSize?: "small" | "big";
  visibility: "active" | "inactive" | "closed";
};

export const projects: Project[] = [
  {
    name: "wiral.app",
    href: "https://wiral.app",
    logo: "https://wiral.app/icon.svg",
    visibility: "active",
  },
  {
    name: "tpot.cc",
    href: "https://tpot.cc",
    logo: "/tpot.png",
    visibility: "active",
  },
  {
    name: "oneDB",
    href: "https://onedb.net",
    logo: "https://onedb.net/icon.svg",
    visibility: "active",
    logoSize: "big",
  },
  {
    name: "nearmate",
    href: "https://nearmate.io",
    logo: "https://nearmate.io/nearmate.png",
    visibility: "inactive",
  },
 
  {
    name: "dotschool",
    href: "https://dotschool.org",
    logo: "https://www.dotschool.org/favicon.ico?favicon.10c00c_9fl9.p.ico",
    visibility: "inactive",
  },
 
  {
    name: "cutefol.io",
    href: "https://cutefol.io",
    logo: "https://cutefol.io/logo.png",
    visibility: "inactive",
  }, {
    name: "onepurplepen",
    href: "https://onepurplepen.com",
    logo: "https://www.onepurplepen.com/logo.png",
    visibility: "closed",
  }

  
];
