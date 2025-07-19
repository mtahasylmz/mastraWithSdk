import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { articleAgent } from './agents';
import { myMastraUpstashStore } from './agents/memory';
import { VercelDeployer } from '@mastra/deployer-vercel';

export const mastra = new Mastra({
  storage: myMastraUpstashStore,
  agents: { articleAgent },
  server: {
    port: 4111, // Defaults to 4111
    timeout: 10000, // Defaults to 30000 (30s)
  },
  deployer: new VercelDeployer()
});
