import { ApolloServer } from "apollo-server-micro";
import { typeDefs } from "@/lib/graphql/schema";
import { resolvers } from "@/lib/graphql/resolvers";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import prisma from "@/lib/prisma";
import cache from "memory-cache";

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers: resolvers,
  playground: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  context: { prisma, cache },
});

const startServer = apolloServer.start();

export default async function handler(req, res) {
  await startServer;
  await apolloServer.createHandler({
    path: "/api/graphql",
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
