import { ApolloServer } from "apollo-server-micro";
import { typeDefs } from "@/lib/graphql/schema";
import { createResolvers } from "@/lib/graphql/resolvers";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers: createResolvers(prisma),
  playground: true,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
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
