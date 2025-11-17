type DemoProfile = {
  sliqId: string;
  wallet: `0x${string}`;
  vault: `0x${string}`;
};

export const DEMO_PROFILES: Record<string, DemoProfile> = {
  "Findy": {
    sliqId: "@findy.sliq.eth",
    wallet: "0x536975e9e6af75045c1a03ccf1cd8b9590e2cb7f" as `0x${string}`,
    vault: "0xFindyVaultAddress" as `0x${string}`,
  },
  "Henry": {
    sliqId: "@allan.sliq",
    wallet: "0x1b87420e029179281b64871d5d79a50e2f457943" as `0x${string}`,
    vault: "0xAllanVaultAddress" as `0x${string}`,
  }
};

export const sender = DEMO_PROFILES["findy"];
export const recipient = DEMO_PROFILES["allan"];
